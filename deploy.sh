#!/usr/bin/env bash
set -eo pipefail

ENV=$1
CLUSTER=$2

ENV_CONFIG=`echo "$ENV" | tr '[:upper:]' '[:lower:]'`

AWS_REGION=$(eval "echo \$${ENV}_AWS_REGION")
AWS_ACCESS_KEY_ID=$(eval "echo \$${ENV}_AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY=$(eval "echo \$${ENV}_AWS_SECRET_ACCESS_KEY")
AWS_ACCOUNT_ID=$(eval "echo \$${ENV}_AWS_ACCOUNT_ID")
AWS_REPOSITORY=$(eval "echo \$${ENV}_AWS_REPOSITORY") 

TAG=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$AWS_REPOSITORY:$CIRCLE_BUILD_NUM

configure_aws_cli() {
	aws --version
	aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
	aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
	aws configure set default.region $AWS_REGION
	aws configure set default.output json
	echo "Configured AWS CLI."
}

configure_aws_cli
sed -i='' "s|app:latest|$TAG|" docker-compose.yml
docker-compose build app
#docker tag app:latest $TAG
eval $(aws ecr get-login --region $AWS_REGION --no-include-email)
docker push $TAG

ecs-cli configure --region us-east-1 --cluster $CLUSTER
ecs-cli compose up --project-name av-scanner-service service up



