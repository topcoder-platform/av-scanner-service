# Topcoder - Submission Scan API

## Requirements

- NodeJS v16.+ (local deployment)
- Docker (docker deployment)

## Configuration

The configurations can be changed in `config/default.js` (default environment) and `config/test.js` (test environment), or by setting OS environment variables. Here are the important configurations that need to configure correctly

- `BUSAPI_EVENTS_URL` Bus API URL
- `AVSCAN_TOPIC` AV Scan Kafka topic
- All environment variables starting with `AUTH0` prefix

## Local Deployment

- Configure the app as above
- Setup and start ClamAV daemon (see section `Setup ClamAV`)
- `npm i`
- `npm start`
- The app will be available at `http://localhost:3000/api/v1` by default
- `npm test` to run tests
- `npm run lint` to run lint check, `npm run lint:fix` to run lint check and fix errors which can be fixed by StandardJS

## Docker Deployment

- Run `docker-compose build` to build the images (including the clamav-scan-api and ClamAV)
- Run `docker-compose up` to run the app
- The app will be available at `http://<your_docker_machine_ip>:3000/api/v1` by default
- You can run the tests by `docker exec -w /usr/src/app clamav-scan-api npm test`
- You can run the lint by `docker exec -w /usr/src/app clamav-scan-api npm run lint`
- You can run the lint:fix by `docker exec -w /usr/src/app clamav-scan-api npm run lint:fix`
