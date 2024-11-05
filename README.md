## Getting Started

Clean architecture Express API server

typescript strict

### Prerequisites

- Node.js
- TypeScript
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/express-test.git
   ```
2. Navigate to the project directory:
   ```sh
   cd express-test
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

### Running the Application

1. Compile TypeScript:
   ```sh
   npm run build
   ```
2. Install docker and docker-compose
   ```sh
   https://docs.docker.com/engine/install/
   https://docs.docker.com/desktop/install/windows-install/
   ```
3. Run servers
   ```sh
   docker-compose up -d
   ```
4. Start the server:
   ```sh
   npm start
   ```

### Testing

Run tests using:

```sh
npm test
```

### Configuration

- Database configuration can be found in `.env`.
- Redis configuration can be found in `.env`.

### Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

### License

This project is licensed under the MIT License.
