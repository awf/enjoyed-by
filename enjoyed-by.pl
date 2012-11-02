#!/bin/sh
exec perl -w -x $0 ${1+"$@"} # -*- perl -*-
#!perl
# Perl script starts here --------------------
#line 6

use strict;

# Author: Andrew W. Fitzgibbon, awf@fitzgibbon.ie
# Purpose:
#  Parse a "holiday expenses file" (see format below),
#  and show who pays whom
# perl -x $HOME\bin\enjoyed-by.pl stchinian2010.txt -csv stchinian2010.csv

my $csv;
my $f;
my $test;
my $verbose = 1;

while ($_ = shift) {
  if ($_ eq '-csv') {
    $csv = shift || die "-csv FILE";
    print "CSV: [$csv]\n";
  }
  elsif ($_ eq '-test') {
    $test = 1;
    $csv = "&STDOUT";
    $f = "<&DATA";
  }
  elsif ($_ eq '-v') {
    $verbose = 1;
  }
  else {
    $f = $_;
  }
}

$f || die "Need filename";

open(F, $f) || die "cannot open input file [$f]: $!";
if ($csv) {
    open(CSV, ">$csv") || die "cannot open output CSV file [$csv]: $!";
}

sub bad {
  s/[\n\r]//g;
  die "bad line: [$_]"
}

sub getline {
    $_ = <F>;
    s/ *#.*//g;
    return $_;
}

my %person = ();
my @personkeys = ();
my %currency = ();
my %currencyname = ();
my @expenses = ();

line:
while ($_ = &getline) {
  if (/^PEOPLE:/) {
    while ($_ = &getline) {
      if (/^(\w+)\t(.*)/) {
	print "person $1 -> $2\n";
	$person{$1} = $2;
	$personkeys[$#personkeys+1] = $1;
      }
      else {
	/^$/ || &bad;
	next line;
      }
    }
  }

  elsif (/^EXPENSES:/) {
    ($_ = &getline) && /^Amount\tCUR\tPayer\tUsers\tItem/ || &bad;
    ($_ = &getline) && /^---/ || &bad;
    while ($_ = &getline) {
      s/[\n\r\t]+$//;
      if (/^$/) {
	next line;
      }
      my @A = split("\t");
      $#A == 4 || die "Wrong number of fields: $_";
      $A[0] =~ / *[0-9.]/ || die "Bad Amount [$A[0]]";
      $A[1] =~ /[^A-Za-z]/ && die "Bad currency code [$A[1]]";
      my $rec = {
	 amount => $A[0],
	 currency => $A[1],
	 payer => $A[2],
	 users => $A[3],
	 item => $A[4]
      };
      $expenses[$#expenses+1] = $rec;
    }
  }
  elsif (/^CURRENCIES:/) {
    # HCU: Holiday Currency Unit
    ($_ = &getline) && /^Code\tHCU(\tName)?/ || &bad;
    ($_ = &getline) && /^---/ || &bad;
    while ($_ = &getline) {
      s/[\n\r]+$//;
      if (/^$/) {
	next line;
      }
      my @A = split("\t");
      $#A == 1 || $#A == 2 || &bad;
      $A[0] =~ /[^A-Za-z]/ && die "Bad currency code [$A[0]]";
      $A[1] =~ /[^0-9.]/ && die "Bad rate [$A[0]]";
      $currency{$A[0]} = $A[1];
      if ($A[2]) {
	$currencyname{$A[0]} = $A[2];
      } else {
	$currencyname{$A[0]} = $A[0];
      }
      print "currency $currencyname{$A[0]} rate $A[1] [code $A[0]]\n";
    }

  } elsif (!(/^$/ || /^#/)) {
    bad;
  }
}

my %paid = ();
my %used = ();

my $q = "\"";

if ($csv) {
  print CSV "Item,Currency,Amount,HCU,Payer";
  foreach my $p (@personkeys) {
    print CSV ",$q".$person{$p}.$q;
  }
  print CSV "\n";
}

foreach my $e (@expenses) {
  my $amt0 = $e->{amount};
  my $amt = $amt0;

  my $currency = "HCU";
  if ($e->{currency}) {
    my $rate = $currency{$e->{currency}};
    ($rate > 0) || die "Bad currency code [$e->{currency}]";
    $amt = $amt0 * $rate;
    $currency = $e->{currency};
  }

  if ($csv) {
    print CSV $q . $e->{item} . "$q,";
    print CSV $q . $currencyname{$currency} . "$q,";
    print CSV $q . $amt0 . "$q,";
    print CSV $q . $amt . "$q,";
    print CSV $q . $person{$e->{payer}} . "$q";
  }

  # Who paid?
  my $payer = $e->{payer};
  if ($payer ne '-') {
      $person{$payer} || die "Do not recognise payer [$payer]";
      $paid{$payer} += $amt;
      $verbose && print "$person{$payer} paid $e->{currency}" . sprintf('%.2f', $amt0) . ($e->{currency} ? sprintf(' (HCU%.2f)', $amt) : "");
  } else {
      $verbose && print "Kitty [$payer] paid  $e->{currency}" . sprintf('%.2f', $amt0) . ($e->{currency} ? sprintf(' (HCU%.2f)', $amt) : "");
  }
  # Who used it?
  my %item_used;
  foreach my $p (@personkeys) {
    $item_used{$p} = 1;
  }
  if ($e->{users} =~ /^\!/) {
    # People who *didn't* use it
    foreach my $p (split(',', substr($e->{users},1))) {
      $person{$p} || die "who is [$p]?";
      $item_used{$p} = 0;
    }
  } elsif ($e->{users} ne '') {
    # inclusive
    foreach my $p (@personkeys) {
      $item_used{$p} = 0;
    }
    foreach my $use (split(',', $e->{users})) {
      if ($use eq '*') {
	foreach my $p (@personkeys) {
	  $item_used{$p} = 1;
	}
      }
      elsif ($use =~ /^([a-z]+)\(([0-9.]+)\)$/) {
	$item_used{$1} = $2;
      }
      else {
	$person{$use} || die "who is [$use]?";
	$item_used{$use} = 1;
      }
    }
  }

  my $totalused = 0;
  foreach my $p (@personkeys) {
    $totalused += $item_used{$p};
  }
  $totalused > 0 || die "Bad total [$e->{users}]";

  foreach my $p (@personkeys) {
    my $used_delta = $amt * $item_used{$p} / $totalused;
    $used{$p} += $used_delta;
    $verbose && $used_delta > 0 && print ", $person{$p} used " . sprintf('%.2f', $used_delta);
  }
  $verbose && print "\n";

  if ($csv) {
    foreach my $p (@personkeys) {
      my $used_delta = $amt * $item_used{$p} / $totalused;
      if ($p eq $e->{payer}) {
	print CSV sprintf(',=%.2f-%.2f', $used_delta, $amt);
      } else {
	print CSV sprintf(',%.2f', $used_delta);
      }
    }
    print CSV "\n";
  }

}

if ($csv) {
  print CSV "\n";
  print CSV ",,,Totals,";
  my $lastrow = $#expenses + 2;
  my $c = ord 'f';
  foreach my $p (@personkeys) {
    print CSV sprintf(',=SUM(%c2:%c%d)', $c, $c, $lastrow);
    ++$c;
  }
  print CSV "\n";
}

print "-- Totals (Sorted) --\n";
my $fmt = "%-20s %10.2f %10.2f %10.2f\n";
printf ("%-20s %10s %10s %10s\n", "Who", "Spent/Got", "Paid", "Balance");

my %balance;
foreach my $p (@personkeys) {
  $balance{$p} = $paid{$p} - $used{$p};
}

my @sortedkeys = sort { $balance{$a} <=> $balance{$b} } keys %balance;

foreach my $p (@sortedkeys) {
  printf ($fmt, $person{$p}, $used{$p}, $paid{$p}, $balance{$p});
}


print "-- Totals (Original Order) --\n";
foreach my $p (@personkeys) {
  printf ($fmt, $person{$p}, $used{$p}, $paid{$p}, $balance{$p});
}

if ($test) {
  if ($balance{'k'} != 768.00) {
    die "*** TEST FAILURE *** $balance{'k'}\n";
  }
}


__DATA__
PEOPLE:
a	Andrew
k	Katie
j	Jamie


EXPENSES:
Amount	CUR	Payer	Users	Item
------	---	-----	-----	----
30	£	a		Wine
1200	EUR	k	*,a(0.5)	Flat
100	EUR	k	a	payment
60	c	a	!j	BLACKCOMB LIQUOR STOWHISTLER BC	
50	£	a	a,k	ELEMENTS URBAN TAPASWHISTLER BC	
120	£	k	a,a,j,k	ELEMENTS URBAN TAPASWHISTLER BC	

CURRENCIES:
Code	HCU	Name
----	---	--------
c	.5	CAD
EUR	.9	EUR
£	1.0	GBP
