""""""
from typing import Self, Callable
import importlib
import pkgutil
import sys

from penflowexecutor import config, exceptions
from penflowexecutor.models import plugins as plugins_models


DEFAULT_PLUGINS_PATH = config.get_plugins_path()
""""""


def load_plugins(path: str = DEFAULT_PLUGINS_PATH):
    """"""
    sys.path.append(path)
    for _, name, is_pkg in pkgutil.iter_modules([path]):
        if is_pkg:
            importlib.import_module(name)
            load_plugins(path=path + "/" + name)
    sys.path.remove(path)


class PluginRegistry:
    """"""
    _instance: Self | None = None
    _plugins: dict[str, type] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PluginRegistry, cls).__new__(cls)
        return cls._instance

    def register(self, name: str) -> Callable[[type], type]:
        """"""
        def _register(cls: type) -> type:
            if name in self._plugins:
                raise exceptions.PenflowBootError(f"Plugin with {name} is already registered")
            if not issubclass(cls, plugins_models.Task):
                raise exceptions.PenflowBootError(
                    f"Wrong plugin implementation for plugin {name}, "
                    "make sure to extend either RunnableTask or BehavioralTask"
                )
            self._plugins[name] = cls
            return cls
        return _register

    @property
    def plugins(self) -> dict:
        """"""
        return self._plugins

    def get(self, name: str) -> type | None:
        return self._plugins.get(name)
