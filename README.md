<h1 align="center">
  Misha's homepage
</h1>

<p align="center">
  <a href="https://github.com/mishamyrt/myrt.co/actions?workflow=Tests">
    <img src="https://github.com/mishamyrt/myrt.co/workflows/Tests/badge.svg">
  </a>
  <a href="https://mishamyrt.github.io/myrt.co/lighthouse/">
    <img src="https://lighthouse-badge.appspot.com/?score=100">
  </a>
  <a href="https://mishamyrt.github.io/myrt.co/sitespeed/">
    <img src="https://img.shields.io/badge/dynamic/json?color=0095d2&url=https://mishamyrt.github.io/myrt.co/sitespeed/data/performance.json&label=Sitespeed.io%20score&query=$[0].metrics[2].value&style=flat-square">
  </a>
</p>

This project is made as an example of the capabilities of GitHub Actions and in order to teach best DevOps practices.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To run the site locally, you should have Node.JS older than version 10 installed.

### Installing

1.  Clone repo
2.  `npm install`
3.  ...
4.  Profit

### Serve

You can start serving local site by running `npm run start`.

## Deployment

Deploy occurs automatically when the code gets into the master branch.

Deploy logic is implemented with ansible playbook.

## Built With

-   [Parcel](https://parceljs.org/) — Incredible bundler
-   [Pug](https://pugjs.org/) — Template engine
-   [Docker](https://www.docker.com/) — Container engine

## Versioning

I use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/mishamyrt/myrt.co/tags).

## Authors

-   **Mikhael Khrustik** — _Initial work_

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
