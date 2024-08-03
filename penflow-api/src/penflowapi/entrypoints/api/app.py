""""""
import contextlib

import fastapi
from fastapi.middleware import cors

from penflowapi import bootstrap
from penflowapi.entrypoints.api.routers import task
from penflowapi.entrypoints.api.routers import flow


@contextlib.asynccontextmanager
async def lifespan(app: fastapi.FastAPI):
    """"""
    app.state.container = bootstrap.bootstrap()
    yield
    app.state.container.db.close()


app = fastapi.FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:3000"
]

app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task.router)
app.include_router(flow.router)


@app.get("/")
async def root():
    """"""
    return {"message": "Penflow is up and running"}
