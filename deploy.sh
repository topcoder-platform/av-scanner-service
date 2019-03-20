#!/usr/bin/env bash
set -eo pipefail

# ENV=$1
CLUSTER=$1

# ENV_CONFIG=`echo "$ENV" | tr '[:upper:]' '[:lower:]'`

# AWS_REGION=$(eval "echo \$${ENV}_AWS_REGION")
# AWS_ACCESS_KEY_ID=$(eval "echo \$${ENV}_AWS_ACCESS_KEY_ID")
# AWS_SECRET_ACCESS_KEY=$(eval "echo \$${ENV}_AWS_SECRET_ACCESS_KEY")
# AWS_ACCOUNT_ID=$(eval "echo \$${ENV}_AWS_ACCOUNT_ID")
# AWS_REPOSITORY=$(eval "echo \$${ENV}_AWS_REPOSITORY") 
# AWS_REPOSITORY_CLAMAV=$(eval "echo \$${ENV}_AWS_REPOSITORY_CLAMAV") 
# AUTH0_URL=$(eval "echo \$${ENV}_AUTH0_URL") 
# AUTH0_CLIENT_ID=$(eval "echo \$${ENV}_AUTH0_CLIENT_ID") 
# AUTH0_CLIENT_SECRET=$(eval "echo \$${ENV}_AUTH0_CLIENT_SECRET") 
# AUTH0_AUDIENCE=$(eval "echo \$${ENV}_AUTH0_AUDIENCE") 
# AUTH0_PROXY_SERVER_URL=$(eval "echo \$${ENV}_AUTH0_PROXY_SERVER_URL") 
# BUSAPI_EVENTS_URL=$(eval "echo \$${ENV}_BUSAPI_EVENTS_URL") 

echo "AUTH0_URL=$AUTH0_URL" >api.env
echo "AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID" >>api.env
echo "AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET" >>api.env
echo "AUTH0_AUDIENCE=$AUTH0_AUDIENCE" >>api.env
echo "AUTH0_PROXY_SERVER_URL=$AUTH0_PROXY_SERVER_URL" >>api.env
echo "BUSAPI_EVENTS_URL=$BUSAPI_EVENTS_URL" >>api.env

TAG=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$AWS_REPOSITORY:$CIRCLE_BUILD_NUM
CLAMAVTAG=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$AWS_REPOSITORY_CLAMAV:$CIRCLE_BUILD_NUM

# configure_aws_cli() {
# 	aws --version
# 	aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
# 	aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
# 	aws configure set default.region $AWS_REGION
# 	aws configure set default.output json
# 	echo "Configured AWS CLI."
# }

# configure_aws_cli
sed -i='' "s|app:latest|$TAG|" docker-compose.yml
sed -i='' "s|clamav:latest|$CLAMAVTAG|" docker-compose.yml
docker-compose build
#docker tag app:latest $TAG
eval $(aws ecr get-login --region $AWS_REGION --no-include-email)
docker push $CLAMAVTAG
docker push $TAG

ecs-cli configure --region us-east-1 --cluster $CLUSTER
ecs-cli compose --project-name av-scanner-service service up



