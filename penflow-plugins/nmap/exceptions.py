from penflowexecutor import exceptions


class NmapRuntimeException(exceptions.PenflowRuntimeError):

    def __init__(self, message: str) -> None:
        self.message = message
