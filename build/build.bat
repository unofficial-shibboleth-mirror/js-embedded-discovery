REM
REM  NOTE NOTE NOTE
REM 
REM  Changes made here need to be reflected in ..\Makefile
REM 

@echo off
setlocal

REM We need a JVM
if not defined JAVA_HOME  (
  echo Error: JAVA_HOME is not defined.
  exit /b
)

set JARCMD="%JAVA_HOME%\bin\jar.exe"
set JAVACMD="%JAVA_HOME%\bin\java.exe"

if not exist %JARCMD% (
  echo "Error: JAVA_HOME is not defined correctly (has to point to a JDK)
  echo Cannot execute %JARCMD%
  exit /b
)


rem Tidy up from previous build

rd /s /q ..\target
mkdir ..\target

rem Build js

copy /b /y ..\src\javascript\idpselect_languages.js+..\src\javascript\typeahead.js+..\src\javascript\idpselect.js %TEMP%\idpselect.js
java -jar yuicompressor-2.4.8.jar -o ..\target\idpselect.js %TEMP%\idpselect.js
del/q %TEMP%\idpselect.js

rem minify CSS
java -jar yuicompressor-2.4.8.jar --type css -o ..\target\idpselect.css ..\src\resources\idpselect.css

rem Copy other files

copy ..\LICENSE.txt ..\target
copy ..\doc\*.txt ..\target
copy ..\src\resources\index.html ..\target
copy ..\src\resources\blank.gif ..\target
copy ..\src\javascript\idpselect_config.js ..\target
mkdir ..\target\nonminimised\
copy ..\src\resources\idpselect.css ..\target\nonminimised\
copy ..\src\javascript\json2.js ..\target\nonminimised\
copy ..\src\javascript\typeahead.js ..\target\nonminimised\
copy ..\src\javascript\idpselect.js ..\target\nonminimised\
copy ..\src\javascript\idpselect_languages.js ..\target\nonminimised\

rem Zip it up

cd ..\target

%JARCMD% cfM  %TEMP%\EDS.zip *
copy %TEMP%\EDS.zip
del/q  %TEMP%\EDS.zip
gpg -a -s -b EDS.zip


