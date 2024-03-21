#!/bin/bash

set -euo pipefail

ENV_NAME=$1
PROJECT_NAME=$2

rsync -aur --stats "public/$2/" "/mnt/gitlab-runner/dist/$ENV_NAME/$PROJECT_NAME/"
