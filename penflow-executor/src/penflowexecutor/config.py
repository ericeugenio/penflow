""""""
import dotenv

config = dotenv.dotenv_values(".env")


def get_plugins_path() -> str:
    """"""
    return config.get("PLUGINS", "")


def get_num_workers() -> int:
    """"""
    return int(config.get("PROCESSES", 2))


def get_mq_host() -> dict[str, str | int]:
    """"""
    return {
        "host": config.get("RABBITMQ_HOST", "localhost"),
        "port": int(config.get("RABBITMQ_PORT", 5672))
    }


def get_mq_pub() -> dict[str, str]:
    """"""
    return {
        "queue": config.get("RABBITMQ_PUB_QUEUE", ""),
        "exchange": config.get("RABBITMQ_PUB_EXCHANGE", "")
    }


def get_mq_sub() -> dict[str, str]:
    """"""
    return {
        "queue": config.get("RABBITMQ_SUB_QUEUE", ""),
        "exchange": config.get("RABBITMQ_SUB_EXCHANGE", "")
    }