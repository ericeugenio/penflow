""""""
from typing import cast
import json

import pika

from penflowapi import bootstrap, config, exceptions, models, services
from penflowapi.models import messages

DEFAULT_HOST = config.get_mq_host()
""""""
DEFAULT_EXCHANGE = config.get_mq_sub().get("exchange")
DEFAULT_QUEUE = config.get_mq_sub().get("queue")
""""""


def main():
    """"""
    app_container = bootstrap.bootstrap(load_tasks=False)
    execution_history_service = app_container.execution_history_service

    def callback(ch, method, properties, body: bytes):
        try:
            message = messages.message_maker(json.loads(body.decode()))
            print(json.dumps(message.to_dict(), indent=2))
            match message.type:
                case messages.MessageType.FLOW_FINISHED_PREMATURELY:
                    message = cast(messages.FlowFinishedPrematurely, message)
                    execution_history_service.update_flow_execution(
                        execution_id=message.execution_id,
                        execution=models.FlowExecution.from_dict({
                            "status": models.ExecutionStatus.FAILED,
                            "detail": message.detail,
                            "endTime": message.timestamp,
                        })
                    )
                case messages.MessageType.FLOW_STARTED:
                    message = cast(messages.FlowStarted, message)
                    execution_history_service.update_flow_execution(
                        execution_id=message.execution_id,
                        execution=models.FlowExecution.from_dict({
                            "status": models.ExecutionStatus.RUNNING,
                        })
                    )
                case messages.MessageType.FLOW_FINISHED:
                    message = cast(messages.FlowFinished, message)
                    execution_history_service.update_flow_execution(
                        execution_id=message.execution_id,
                        execution=models.FlowExecution.from_dict({
                            "status": models.ExecutionStatus.SUCCEED if message.success else models.ExecutionStatus.FAILED,
                            "detail": message.detail,
                            "endTime": message.timestamp,
                        })
                    )
                case messages.MessageType.TASK_STARTED:
                    message = cast(messages.TaskStarted, message)
                    execution_history_service.add_task_execution(
                        execution_id=message.execution_id,
                        execution=models.TaskExecution.from_dict({
                            "taskId": message.task_id,
                            "taskName": message.task_name,
                            "status": models.ExecutionStatus.RUNNING,
                            "startTime": message.timestamp,
                        })
                    )
                case messages.MessageType.TASK_FINISHED:
                    message = cast(messages.TaskFinished, message)
                    execution_history_service.update_task_execution(
                        execution_id=message.execution_id,
                        execution=models.TaskExecution.from_dict({
                            "taskId": message.task_id,
                            "taskName": message.task_name,
                            "status": models.ExecutionStatus.SUCCEED if message.success else models.ExecutionStatus.FAILED,
                            "detail": message.detail,
                            "endTime": message.timestamp,
                            "output": message.output,
                            "steps": message.steps,
                        })
                    )
                case _:
                    raise exceptions.InvalidMessageError(message_type=message.type)
        except exceptions.PenflowError as e:
            print(e.message)
        except Exception as e:
            print(e)

    connection = pika.BlockingConnection(pika.ConnectionParameters(**DEFAULT_HOST))
    channel = connection.channel()
    channel.exchange_declare(exchange=DEFAULT_EXCHANGE, exchange_type="fanout")
    channel.queue_declare(queue=DEFAULT_QUEUE, durable=True)
    channel.queue_bind(exchange=DEFAULT_EXCHANGE, queue=DEFAULT_QUEUE)
    channel.basic_consume(queue=DEFAULT_QUEUE, on_message_callback=callback, auto_ack=True)

    try:
        print("[*] Waiting for messages. To exit press CTRL+C")
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Exiting")
    finally:
        app_container.db.close()
        channel.stop_consuming()
        connection.close()


if __name__ == "__main__":
    main()
