var Docker = require("dockerode");
// const path = require("path")
var localDocker = new Docker();

// console.log("PATH:", __dirname)

async function main() {
  // 镜像列表
  // const res = await localDocker.listImages();
  // console.log(res)
  // [
  //   {
  //     Containers: -1,
  //     Created: 1628797142,
  //     Id: 'sha256:f4489eef8885a8c994a0e9f5094b19596df58a89d1b18471ebb46cfbb84314c9',
  //     Labels: null,
  //     ParentId: '',
  //     RepoDigests: [
  //       'openjdk@sha256:ad240a929c34ed18ca8a4e1eec679813513391e74e882b15d69d9131ff72ec41'
  //     ],
  //     RepoTags: [ 'openjdk:16.0.2' ],
  //     SharedSize: -1,
  //     Size: 466931413,
  //     VirtualSize: 466931413
  //   }
  // ]

  // 创建镜像
  try {
    // const res2 = await localDocker.buildImage(path.join(__dirname, "Dockerfile"), { t: "test1" });
    const res2 = await localDocker.buildImage(
      {
        context: "/home/suwings/Project2104-Daemon/test_file/test_docker",
        src: ["Dockerfile"]
      },
      { t: "test1:16" }
    );
    console.log("创建指令发送");
  } catch (error) {
    console.log("创建错误", error);
  }

  // 删除镜像
  // await localDocker.getImage("test1").remove();

  // 利用镜像创建容器
  // const container = await localDocker.createContainer({
  //   Image: "openjdk:16.0.2",
  //   AttachStdin: true,
  //   AttachStdout: true,
  //   AttachStderr: true,
  //   Tty: true,
  //   User: `${process.getuid()}:${process.getgid()}`,
  //   WorkingDir: "/workspace/",
  //   Cmd: ["java", "-jar", "paper-1.17.1-186.jar"],
  //   OpenStdin: true,
  //   StdinOnce: false,
  //   HostConfig: {
  //     Binds: ["/home/suwings/dockernode/test_file/:/workspace/"]
  //   }
  // });

  // // 启动容器
  // await container.start();

  // const stream = await container.attach({ stream: true, stdout: true, stderr: true, stdin: true });
  // stream.on("data", (data) => {
  //   process.stdout.write("[Container]" + data.toString());
  // });
  // stream.on("error", (data) => {
  //   console.log("[Container error]", data.toString());
  // });
  // stream.on("close", async () => {
  //   console.log("[Container close] ----------------");
  // });
  // // stream.write("help\n")

  // // stream.write("java -jar spigot-1.16.5.jar\n")
  // // stream.write("exit\n")
  // // 等待容器退出
  // container.wait(async () => {
  //   console.log("-------------------- container.wait() --------------------");
  //   await container.remove();
  // });

  // setTimeout(() => {
  //   stream.write("stop\n");
  // }, 10000);

  // setTimeout(async () => {
  // await container.kill();
  // await container.remove();
  // }, 3000);

  // [
  //   {
  //     Id: '2882659c40c60cd1ebca058b8b65014887a7126f7cda7c1309c88b510fc4852d',
  //     Names: [ '/musing_dirac' ],
  //     Image: 'openjdk:16.0.2',
  //     ImageID: 'sha256:f4489eef8885a8c994a0e9f5094b19596df58a89d1b18471ebb46cfbb84314c9',
  //     Command: '/bin/bash',
  //     Created: 1629017421,
  //     Ports: [],
  //     Labels: {},
  //     State: 'running',
  //     Status: 'Up Less than a second',
  //     HostConfig: { NetworkMode: 'default' },
  //     NetworkSettings: { Networks: [Object] },
  //     Mounts: []
  //   }
  // ]
  // const res3 = await localDocker.listContainers()
  // console.log("容器列表:", res3)
}

main();
