import os

from multiprocessing import Pool, cpu_count
from subprocess import check_call, CalledProcessError


def BuildProcess(cmd: str):
    try:
        print(f"BUILDING {cmd}")
        check_call("pwd")
        check_call(cmd)
    except CalledProcessError:
        pass


if __name__ == "__main__":
    with Pool(cpu_count()-1) as p:
        p.map(BuildProcess, [
            "cp -R dist ../electron_app/dist/renderer",
            "pushd ../web_app && npm run build &&  && popd"
        ])
