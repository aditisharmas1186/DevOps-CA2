FROM golang:1.25

WORKDIR /app

COPY . .

# Download and install dependencies
RUN go mod tidy

# Build the Go app
RUN go build -o api .

# Expose port 8080
EXPOSE 8080

# Run the binary
CMD ["./api"]
