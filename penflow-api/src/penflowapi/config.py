import dotenv

config = dotenv.dotenv_values(".env")


def get_tasks_path() -> str:
    """"""
    return config.get("PLUGINS", "")


def get_mongo_host() -> dict[str, str | int]:
    """"""
    return {
        "host": config.get("MONGO_HOST", "localhost"),
        "port": int(config.get("MONGO_PORT", 27017))
    }


def get_mongo_db() -> str:
    """"""
    return config.get("MONGO_DB", "penflow")


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


def get_redis_host() -> dict[str, str | int]:
    """"""
    return {
        "host": config.get("REDIS_HOST", "localhost"),
        "port": config.get("REDIS_PORT", 6379)
    }
