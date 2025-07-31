<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# MyHRIS Backend

A NestJS-based HR Information System backend API.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Documentation

### Attendance Endpoints

#### Submit Attendance (FormData)
**POST** `/attendances/submit`

Submit attendance with image upload using FormData.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Query Parameters:**
- `tenant` (required): Database tenant
- `em_id` (required): Employee ID
- `start_periode` (optional): Start period
- `end_periode` (optional): End period

**FormData Fields:**
- `image` (optional): Image file (PNG, JPG, etc.)
- `tanggal_absen` (optional): Attendance date (YYYY-MM-DD)
- `reg_type` (required): Registration type (0 = no image, 1 = with image)
- `type_attendance` (optional): Attendance type (1 = check-in, 2 = check-out)
- `location` (optional): Location string
- `note` (optional): Attendance note
- `lat_lang` (optional): Latitude and longitude
- `place` (optional): Place name
- `category` (optional): Attendance category

**Example Request:**
```bash
curl -X POST "http://localhost:3000/attendances/submit?tenant=company&em_id=EMP001" \
  -H "Authorization: Bearer <token>" \
  -F "image=@photo.png" \
  -F "reg_type=1" \
  -F "type_attendance=1" \
  -F "location=Office Building" \
  -F "note=Check in for work" \
  -F "lat_lang=-6.2088,106.8456" \
  -F "place=Main Office"
```

#### Submit Attendance Break (FormData)
**POST** `/attendances/submit-break`

Submit break attendance with image upload using FormData.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Query Parameters:**
- `tenant` (required): Database tenant
- `em_id` (required): Employee ID
- `start_periode` (optional): Start period
- `end_periode` (optional): End period

**FormData Fields:**
- `image` (optional): Image file (PNG, JPG, etc.)
- `tanggal_absen` (optional): Attendance date (YYYY-MM-DD)
- `reg_type` (required): Registration type (0 = no image, 1 = with image)
- `type_attendance` (optional): Attendance type (1 = break-in, 2 = break-out)
- `location` (optional): Location string
- `note` (optional): Attendance note
- `lat_lang` (optional): Latitude and longitude
- `place` (optional): Place name
- `category` (optional): Attendance category

**Example Request:**
```bash
curl -X POST "http://localhost:3000/attendances/submit-break?tenant=company&em_id=EMP001" \
  -H "Authorization: Bearer <token>" \
  -F "image=@break_photo.png" \
  -F "reg_type=1" \
  -F "type_attendance=1" \
  -F "location=Cafeteria" \
  -F "note=Break time" \
  -F "lat_lang=-6.2088,106.8456" \
  -F "place=Cafeteria"
```

### Response Format

Both endpoints return the same response format:

```json
{
  "status": true,
  "message": "berhasil kirim absen",
  "title": "",
  "is_show_notif": false,
  "deskription": "",
  "status_absen": "",
  "data": {
    "em_id": "EMP001",
    "atten_date": "2024-01-15",
    "signin_time": "08:00:00",
    "signout_time": "00:00:00",
    "place_in": "Main Office",
    "place_out": "",
    "signin_longlat": "-6.2088,106.8456",
    "signout_longlat": "",
    "signin_pict": "abc123150120240800.png",
    "signout_pict": "",
    "signin_note": "Check in for work",
    "signout_note": "",
    "signin_addr": "Office Building",
    "signout_addr": "",
    "atttype": 0,
    "reg_type": 1,
    "image_uploaded": true,
    "image_path": "/foto_absen/company/abc123150120240800.png",
    "original_filename": "photo.png",
    "file_size": 1024000
  }
}
```

### Features

- **Image Upload**: Automatic image upload to FTP server
- **Late Detection**: Automatic late attendance detection
- **Overtime Calculation**: Automatic overtime calculation
- **Warning Letters**: Automatic warning letter generation for repeated violations
- **Break Management**: Separate break-in/break-out tracking
- **Location Tracking**: GPS coordinates and place tracking
- **Multi-tenant**: Support for multiple company databases

### Error Handling

The API returns proper error responses:

```json
{
  "statusCode": 400,
  "message": "tenant dan em_id harus disediakan",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 500,
  "message": "Gagal kirim absen",
  "error": "Internal Server Error"
}
```
