@echo off
@echo Run grunt in debug mode with node inspector

set GRUNT_PATH=C:\Users\Ismael\AppData\Roaming\npm\node_modules\grunt-cli\bin
node --debug-brk %GRUNT_PATH%\grunt serve

