$s = $MyInvocation.InvocationName -replace '\\[^\\]*$',''
& l:\pkg\Perl\bin\perl.exe -x $s\enjoyed-by.pl $args[0] $args[1] $args[2] $args[3] $args[4] 
