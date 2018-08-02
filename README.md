# Topcoder - Submission ClamAV API

## Requirements

- NodeJS v8.+ (local deployment)
- ClamAV (local deployment
- Docker (docker deployment)

## Configuration

The configurations can be changed in `config/default.js` (default environment) and `config/test.js` (test environment), or by setting OS environment variables. Here are the important configurations that need to configure correctly

- `CLAMAV_HOST` the ClamAV daemon host (`TCPAddr` in `clam.conf`)
- `CLAMAV_PORT` the ClamAV daemon port (`TCPSocket` in `clam.conf`)

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
  **NOTE** ClamAV deamon needs some time to get started (about 30 seconds in my environment), so wait for it before making calls to the API or running tests
- You can run the tests by `docker exec -w /usr/src/app clamav-scan-api npm test`
- You can run the lint by `docker exec -w /usr/src/app clamav-scan-api npm run lint`
- You can run the lint:fix by `docker exec -w /usr/src/app clamav-scan-api npm run lint:fix`

## Manual Verification

- You can use `Postman` or `cURL` to make call to `http://localhost:3000/api/v1/scan` to verify
- Example call with `cURL` on my Windows:

```bash
> curl -X POST http://localhost:3000/api/v1/scan -F "file=@C:\EICAR_submission.zip"
{"infected":true,"malicious":"Eicar-Test-Signature"}
```

## How to use the REST API

- The API accepts POST request with content type `multipart/form-data`
- The form field name should be `file`
- The response json format includes 2 properties:

```json
{"infected":true,"malicious":"Eicar-Test-Signature"}
```

- `infected`: true if the file was infected by a malicious, otherwise false
- `malicious`: (optional) the malicious found by ClamAV, only present if `infected` is true

## Setup ClamAV

- Go to https://www.clamav.net/downloads
- Under `Alternate Versions of ClamAV` section, choose your OS and follow the instructions to download or install ClamAV (including `clamd`)
- Copy `<ClamAV-directory>/conf_examples/clamd.conf.sample` to `<ClamAV-directory>/clamd.conf`
- Copy `<ClamAV-directory>/conf_examples/freshclam.conf.sample` to `<ClamAV-directory>/freshclam.conf`
- Comment-out line 8 in both `clamd.conf` and `freshclam.conf` files:

```bash
# Comment or remove the line below.
# Example
```

- Run `freshclam` to update virus database
- Run `clamd` to start ClamAV deamon
