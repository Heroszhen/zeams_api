#! /bin/bash
#push to github

message='maj'
if [[ $1 != '' ]] 
then
    message=$1
fi

echo "message: $message"
git add .
git commit -m "$message"
git push