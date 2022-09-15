#!/bin/bash

USAGE="\
This script allows you to quickly locate where a term is used inside all
project source files.

usage:
    ./search.sh <regex>

Where <regex> is handed off to egrep for searching through the source files.";

function printUsage {
    echo "$USAGE";
}

function exitError {
    echo "$0: $1";
    printUsage;
    exit 1;
}

if [ $# -lt 1 ];
then
    exitError "Missing arguments.";
fi

if [ $# -gt 1 ];
then
    exitError "Too many arguments.";
fi

case $1 in
    -h|--help)
        printUsage;
        ;;
    *)
        egrep -rnH --colour \
            --include='*.js' \
            --include='*.html' \
            --exclude-dir='node_modules' \
            --exclude-dir='libs' \
            --exclude-dir='coverage' \
            --exclude-dir='dist' \
            --exclude-dir='docs' \
            "$1"
        ;;
esac

exit 0;

