export default {
  // -----------------------
  // src\
  // -----------------------

  // src\app.ts
  app: {
    welcome: "Welcome to the MCSManager daemon",
    instanceLoad: "All application instances loaded, total {{n}}",
    instanceLoadError: "Failed to read local instance file:",
    sessionConnect: "Session {{ip}} {{uuid}} connected",
    sessionDisconnect: "Session {{ip}} {{uuid}} disconnected",
    started: "The daemon has now been successfully started",
    doc: "Reference documentation: https://docs.mcsmanager.com/",
    addr: "Access address: http://<IP address>:{{port}}/ or ws://<IP address>:{{port}}",
    configPathTip: "Configuration file: data/Config/global.json",
    password: "Access key: {{key}}",
    passwordTip: "Key as the only authentication method, please use the node function connection program of the MCSManager panel",
    exitTip: "You can use the Ctrl+C shortcut to close the program"
  },

  // -----------------------
  // src\common\
  // -----------------------

  common: {
    title: "Title",
    _7zip: "[7zip compression task]",
    _7unzip: "[7zip unzip task]",
    killProcess: "The process {{pid}} has been force-killed using a system command",
    uuidIrregular: "UUID {{uuid}} does not conform to the specification"
  },

  // -----------------------
  // src\entity\commands\
  // -----------------------

  // src\entity\commands\base\command_parser.ts
  command: {
    quotes:
      "Incorrect command double quotes, can't find pairs of double quotes, if you want to use a single double quote please use the {quotes} symbol",
    errLen: "Wrong command length, please make sure the command format is correct",
    instanceNotOpen: "The command execution failed because the actual process of the instance does not exist"
  },
  // src\entity\commands\docker\docker_start.ts
  instance: {
    dirEmpty: "Start command, I/O encoding or working directory is empty",
    dirNoE: "Working directory does not exist",
    invalidCpu: "Illegal CPU core specification {{v}}",
    invalidContainerName: "Invalid container name {{v}}",
    successful: "Instance {{v}} started successfully"
  },
  // src\entity\commands\start.ts
  start: {
    instanceNotDown: "The instance is not in a shutdown state and cannot be started again",
    instanceMaturity: "The instance usage expiration time has expired, and the instance cannot be started again",
    startInstance: "Starting instance..."
  },
  // src\entity\commands\general\general_restart.ts
  restart: {
    start: "Restart the instance plan to start executing",
    error1:
      "The state of restarting the instance is incorrect, the instance has already been started, and the restart plan of the last state is canceled",
    error2:
      "The status of the restarting instance is incorrect. The status of the instance should be in the stopped state, and now it is running. The restart plan is canceled",
    restarting: "Detected server stopped, restarting instance..."
  },
  // src\entity\commands\general\general_start.ts
  general_start: {
    instanceConfigErr: "Start command, I/O code or working directory is empty",
    cwdPathNotExist: "The working directory does not exist",
    cmdEmpty: "Unable to start instance, start command is empty",
    startInstance: "Session {{source}}: Request to start instance.",
    instanceUuid: "Instance identifier: [{{uuid}}]",
    startCmd: "Start command: {{cmdList}}",
    cwd: "Working directory: {{cwd}}",
    pidErr: `Detected instance process/container startup failure (PID is empty), the possible reasons are:
    1. The instance startup command is written incorrectly. Please go to the instance setting interface to check the startup command and parameters.
    2. The system host environment is incorrect or missing, such as the Java environment.
    
    Native startup command:
    {{startCommand}}
    
    Start command parsing body:
    Program: {{commandExeFile}}
    Parameters: {{commandParameters}}
    
    Please report this information to an administrator, technician, or troubleshoot yourself. `,
    startErr: "The instance failed to start, please check the startup command, host environment and configuration file, etc.",
    startSuccess: "Instance {{instanceUuid}} successfully started PID: {{pid}}.",
    startOrdinaryTerminal:
      "The application instance is running, and the terminal is in normal terminal mode. You can send commands in the command input box at the bottom. Function keys such as Ctrl and Tab are not supported."
  },
  // src\entity\commands\general\general_stop.ts
  general_stop: {
    notRunning: "The instance is not running and cannot be stopped.",
    execCmd:
      "The default shutdown command has been executed: {{stopCommand}}\nIf the instance cannot be shut down, please go to the instance settings to change the correct command to shut down the instance, such as ^C, stop, end, etc.",
    stopErr:
      "The shutdown command has been issued but the instance has not been shut down for a long time. It may be caused by an error in the instance shutdown command or the suspended process of the instance. Now it will return to the running state. You can use the forced termination command to end the process."
  },
  // src\entity\commands\general\general_update.ts
  general_update: {
    statusErr_notStop: "The instance status is incorrect, the update task cannot be performed, and the instance must be stopped",
    statusErr_otherProgress: "Instance status is incorrect, other tasks are running",
    readyUpdate: "Instance {{instanceUuid}} is preparing for an update operation...",
    updateCmd: "The instance {{instanceUuid}} executes the update command as follows:",
    cmdFormatErr: "Update command format error, please contact administrator",
    err: "Error",
    updateFailed: "The update failed, the update command failed to start, please contact the administrator",
    update: "Update",
    updateSuccess: "Update succeeded!",
    updateErr: "The update process is over, but the result is incorrect, maybe the file update is damaged or the network is not smooth",
    error: "Update error: {{err}}",
    terminateUpdate: "The user requested to terminate the update asynchronous task of instance {{instanceUuid}}",
    killProcess: "Force killing the task process..."
  },
  // src\entity\commands\pty\pty_start.ts
  pty_start: {
    cmdErr: "Start command, I/O encoding or working directory is empty",
    cwdNotExist: "Working directory does not exist",
    startPty: "Session {{source}}: request to start an instance, the mode is an emulated terminal",
    startErr:
      "Failed to emulate terminal mode, maybe the dependent program does not exist, it has been automatically downgraded to normal terminal mode...",
    notSupportPty:
      "Failed to emulate terminal mode, the unsupported architecture or system has been automatically downgraded to normal terminal mode...",
    cmdEmpty: "Unable to start instance, start command is empty",
    sourceRequest: "Session {{source}}: Request to open instance.",
    instanceUuid: "Instance identifier: [{{instanceUuid}}]",
    startCmd: "Start command: {{cmd}}",
    ptyPath: "PTY path: {{path}}",
    ptyParams: "PTY parameters: {{param}}",
    ptyCwd: "Working directory: {{cwd}}",
    pidErr: `Detected instance process/container startup failure (PID is empty), the possible reasons are:
    1. The instance startup command is written incorrectly. Please go to the instance setting interface to check the startup command and parameters.
    2. The system host environment is incorrect or missing, such as the Java environment.
    
    Native startup command:
    {{startCommand}}
    
    Emulated terminal transfer command:
    Program: {{path}}
    Parameters: {{params}}
    
    Please report this information to an administrator, technician, or troubleshoot yourself.
    If you think the problem is caused by the panel emulation terminal, please turn off the "emulate terminal" option in the terminal settings on the left, and we will use the original input and output stream to monitor the program. `,
    instanceStartErr: "The instance failed to start, please check the startup command, host environment and configuration file, etc.",
    startSuccess: "Instance {{instanceUuid}} successfully started PID: {{pid}}.",
    startEmulatedTerminal:
      "Full emulated terminal mode has taken effect. You can directly input content in the terminal and use function keys such as Ctrl and Tab.",
    mustAbsolutePath:
      "The working directory of the emulation terminal must use the absolute path. Please go to the instance setting interface to reset the working path to the absolute path."
  },
  // src\entity\commands\pty\pty_stop.ts
  pty_stop: {
    notRunning: "The instance is not running and cannot be stopped.",
    execCmd:
      "The default shutdown command has been executed: {{stopCommand}}\nIf the instance cannot be shut down, please go to the instance settings to change the correct command to shut down the instance, such as exit, stop, end, etc.",
    stopErr:
      "The shutdown command has been issued but the instance has not been shut down for a long time. It may be caused by an error in the instance shutdown command or the suspended process of the instance. Now it will return to the running state. You can use the forced termination command to end the process."
  },

  // -----------------------
  // src\entity\instance\
  // -----------------------

  // src\entity\instance\instance.ts
  instanceConf: {
    initInstanceErr: "Failed to initialize instance, unique identifier or configurationparameter is empty",
    cantModifyInstanceType: "This instance type cannot be modified while running",
    cantModifyProcessType: "This instance process type cannot be modified while it is running",
    cantModifyPtyModel: "Can't modify PTY model while running",
    ptyNotExist:
      "Unable to enable terminal emulation because the {{path}} attached program does not exist, you can contact the administrator to restart the Daemon program to reinstall (Linux only)",
    instanceLock: "This {{info}} operation cannot be performed because the instance is locked, please try again later.",
    instanceBusy: "The current instance is busy and cannot perform any operations.",
    info: "Information",
    error: "Error",
    autoRestart: "Detected instance shutdown, according to the active event mechanism, the automatic restart command has been issued...",
    autoRestartErr: "Auto restart error: {{err}}",
    instantExit:
      "Detected that the instance exited within a very short period of time after starting. The reason may be that your start command is wrong or the configuration file is wrong."
  },
  // src\entity\instance\preset.ts
  preset: {
    actionErr: "The default command {{action}} is not available"
  },
  // src\entity\instance\process_config.ts
  process_config: {
    writeEmpty: "The write content is empty, maybe the configuration file type is not supported"
  },

  // -----------------------
  // src\entity\minecraft\
  // -----------------------

  // src\entity\minecraft\mc_update.ts
  mc_update: {
    updateInstance: "Update instance..."
  },

  // -----------------------
  // src\routers\
  // -----------------------

  // src\routers\auth_router.ts
  auth_router: {
    notAccess: "The session {{id}}({{address}}) attempted to access {{event}} without permission and is now blocked.",
    illegalAccess: "Insufficient permissions, illegal access",
    access: "Session {{id}}({{address}}) authenticated successfully",
    disconnect: "Session {{id}}({{address}}) disconnected due to long unauthenticated identity"
  },
  // src\routers\environment_router.ts
  environment_router: {
    dockerInfoErr: "Unable to get image information, please make sure you have installed the Docker environment correctly",
    crateImage: "The daemon is creating the image {{name}}:{{tag}} DockerFile as follows:\n{{dockerFileText}}\n",
    crateSuccess: "Creating image {{name}}:{{tag}} completed",
    crateErr: "Create image {{name}}:{{tag}} error:{{error}}",
    delImage: "The daemon is deleting the image {{imageId}}"
  },
  // src\routers\file_router.ts
  file_router: {
    instanceNotExist: "Instance {{instanceUuid}} does not exist",
    unzipLimit:
      "Exceeded the maximum number of simultaneous decompression tasks, the maximum allowed {{maxFileTask}}, there are currently {{fileLock}} tasks in progress, please be patient"
  },
  // src\routers\http_router.ts
  http_router: {
    instanceNotExist: "Instance does not exist",
    fileNameNotSpec: "User file download name does not conform to the specification",
    downloadErr: "Download error: {{error}}",
    updateErr: "Unknown reason: upload failed"
  },
  // src\routers\Instance_router.ts
  Instance_router: {
    requestIO: "Session {{id}} requests forwarding instance {{targetInstanceUuid}} IO stream",
    cancelIO: "Session {{id}} requests to cancel forwarding instance {{targetInstanceUuid}} IO stream",
    openInstanceErr: "Error starting instance {{instanceUuid}}: ",
    performTasks: "Session {{id}} asks instance {{uuid}} to perform async {{taskName}} async tasks",
    performTasksErr: "Instance {{uuid}} {{taskName}} asynchronous task execution exception: {{err}}",
    taskEmpty: "No asynchronous tasks are running",
    accessFileErr: "File does not exist or path is wrong, file access is denied",
    terminalLogNotExist: "The terminal log file does not exist"
  },
  // src\routers\passport_router.ts
  passport_router: {
    registerErr: "undefinable task name or key is empty"
  },
  // src\routers\stream_router.ts
  stream_router: {
    unauthorizedAccess: "Insufficient permissions, illegal access",
    taskNotExist: "Task does not exist",
    instanceNotExist: "Instance does not exist",
    authSuccess: "Session {{id}} {{address}} dataflow channel authentication succeeded",
    establishConnection: "Session {{id}} {{address}} has established a data channel with {{uuid}}",
    disconnect: "Session {{id}} {{address}} has disconnected data channel from {{instanceUuid}}"
  },

  // -----------------------
  // src\service\
  // -----------------------

  // src\service\file_router_service.ts
  file_router_service: {
    instanceNotExit: "Instance {{uuid}} does not exist"
  },
  // src\service\install.ts
  install: {
    ptyNotSupportSystem:
      "The emulated terminal can only support the Windows/Linux x86_64 architecture and has been automatically downgraded to a normal terminal",
    ptySupport: "Identified optional dependency library installation, emulated terminal function is available",
    skipInstall: "Detected that the system is not a Linux system, and automatically skips the installation of dependent libraries",
    installed:
      "Optional dependencies have been installed automatically, terminal emulation and some advanced functions have been automatically enabled",
    guide: "Dependency program reference: https://github.com/mcsmanager/pty",
    changeModeErr: "Failed to modify the permission of the file {{path}}, please manually set it to above chmod 755",
    installErr:
      "Failed to install the optional dependency library, the full emulated terminal and some optional functions will not be available, which will not affect normal functions, and will try to install it at the next startup"
  },
  // src\service\protocol.ts
  protocol: {
    socketErr: "Exception in session {{id}}({{address}})/{{event}} response data:\n"
  },
  // src\service\router.ts
  router: {
    initComplete: "All functional modules and permission firewalls have been initialized"
  },
  // src\service\system_file.ts
  system_file: {
    illegalAccess: "Illegal access path",
    unzipLimit:
      "File decompression only supports decompression of files with a maximum size of {{max}}GB. To change the upper limit, please go to the data/Config/global.json file",
    execLimit: "Maximum file edit limit exceeded"
  },
  // src\service\system_instance_control.ts
  system_instance_control: {
    execLimit: "Cannot continue to create scheduled tasks to reach the limit",
    existRepeatTask: "A repeating task already exists",
    illegalName: "Illegal program name, only supports underscores, numbers, letters and some local languages",
    crateTask: "Create scheduled task {{name}}:\n{{task}}",
    crateTaskErr:
      "Scheduled task creation error, incorrect time expression: \n{{name}}: {{timeArray}}\nPlease try to delete the data/TaskConfig/{{name}}.json file to resolve this issue",
    crateSuccess: "Creating scheduled task {{name}} completed",
    execCmdErr: "Instance {{uuid}} scheduled task {{name}} executed error: \n {{error}}"
  },
  // src\service\system_instance.ts
  system_instance: {
    autoStart: "Instance {{name}} {{uuid}} autostart command has been issued",
    autoStartErr: "Instance {{name}} {{uuid}} autostart error: {{reason}}",
    readInstanceFailed: "Failed to read {{uuid}} application instance: {{error}}",
    checkConf: "Please check or delete the file: data/InstanceConfig/{{uuid}}.json",
    uuidEmpty: "Cannot add an instance because the instance UUID is empty"
  },
  // src\service\ui.ts
  ui: {
    help: '[terminal] The daemon has basic interactive functions, please type "help" for more information'
  },
  // src\service\version.ts
  version: {
    versionDetectErr: "Version check failed"
  }
};
// import { $t } from "../../i18n";
// $t("permission.forbiddenInstance");]
// $t("router.login.ban")
