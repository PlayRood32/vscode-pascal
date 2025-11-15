program main;

{$APPTYPE CONSOLE}

uses
  SysUtils;

var
    name: string;

begin
    Writeln('Enter your name: ');
    ReadLn(name);
    WriteLn('Hello, ', name, '! Welcome to Pascal programming.');
    WriteLn('Press Enter to exit.');
    ReadLn;
end.

