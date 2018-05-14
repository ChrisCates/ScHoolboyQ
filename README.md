# ScHoolboy Q's Shell Interface
## By Chris Cates (for ScHoolboy Q)

This shell interface tackles issues with traditional shell interfaces. The name of the interface is named after ScHoolboy Q for no particular reason except `Grooveline`.

## Goals and Intentions
### 1. Normal shell interfaces don't show data the best way

Traditionally, users of unix have resorted to tmux for interfacing with multiple sessions at once. ScHoolboy Q on the otherhand always gives the user an option to view (or filter) these key data outputs:

1. `stdout`: normal output data
2. `stderr`: error output data
3. `pid`: what process id it is currently using
4. `process signal`: the state of the process (is it running, stopped, exited)

### 2. Traversing the filesystem is cumbersome and frustrating

ScHoolboy Q intends to give a good balance between speed and readability of folder structures. You can always tweak how ScHoolboy Q traverses the filesystem, forcing it to do recursive walks of only certain folders, watching parts of the filesystem at certain time intervals, and to ignore reading parts of your filesystem altogether.

### 3. Parallelized commands are impossible in normal shell

ScHoolboy Q makes sure that every command is a first class citizen. ScHoolboy Q makes sure that you can view everything that happened with that command... The amount of time it took to execute, as well as everything specified in point 1.

### Summary

The initial prototype tackles these issues first and foremost... However, I am open to new ideas that may improve interfacing with shells. Feel free to drop an issue... However, you should read the guidelines for posting an issue first. Issues will not be read unless you quote a verse from ScHoolboy Q in the issue.

## Compiling and running for yourself

1. Expects Node (8 > YOUR_VERSION < 9 at the time of writing)
2. Build scripts require yarn `sudo npm install yarn -g`
3. Need to `yarn install` in both root directory and the `./ui` directory to debug fully.
4. You can now test with `yarn run dev_start`
5. Review `package.json` for appropriate build commands.

MIT Licensed
