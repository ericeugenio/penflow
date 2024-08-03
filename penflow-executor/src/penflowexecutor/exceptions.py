""""""


class PenflowError(Exception):
    """"""
    message: str

    def __str__(self) -> str: return self.message


class PenflowBootError(PenflowError):
    """"""
    def __init__(self, details: str):
        self.message = f"Bootstrap error: {details}."


class PenflowValidationError(PenflowError):
    """"""
    def __init__(self, details: str):
        self.message = f"Validation error: {details}."


class InvalidMessageError(PenflowValidationError):
    """"""

    def __init__(self, message_type: str):
        super().__init__(f"{message_type} is not a valid message type.")
        self.message_type = message_type


class BadMessageError(PenflowValidationError):
    """"""

    def __init__(self, message_type: str, data: list[str]):
        super().__init__(f"Attributes {','.join(data)} are missing for message type '{message_type}'.")
        self.message_type = message_type
        self.data = data


class PenflowRuntimeError(PenflowError):
    """"""

    def __init__(self, origin: str, detail: str):
        self.message = f"Runtime error: {detail}."
        self.origin = origin
