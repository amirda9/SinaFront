
# SinaFront

SinaFront is a Dockerized frontend application aimed at debugging and development of the Sina app. This repository contains configuration files and Docker setup to facilitate quick deployment and testing.

## Features

- **Docker Support**: The app is fully containerized using Docker and Docker Compose.
- **Nginx Configuration**: Includes a custom `default.conf` for Nginx server setup.
- **Automated Build and Deployment**: Simple deployment with `docker-compose`.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/amirda9/SinaFront.git
   cd SinaFront
   ```

2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

3. Access the app by navigating to `http://localhost` in your browser.

## Configuration

- **Nginx Configuration**: Modify `default.conf` to customize the Nginx server settings as needed.
- **Dockerfile**: Update the `Dockerfile` for any specific environment requirements.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
