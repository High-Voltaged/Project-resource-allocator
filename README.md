# The Project Resource Allocator

## Description

A PM application, designed to provide automatic resource allocation for the given tasks based on the availability and skillset of existing employees.

## Conceptual Database Model

![Thesis DB](https://github.com/High-Voltaged/Project-resource-allocator/assets/71522782/aaba0bca-601f-4679-a555-1cf6d90a38fd)

## The Task Allocation Process

### Sequence Diagram

![activity-Sequence drawio](https://github.com/High-Voltaged/Project-resource-allocator/assets/71522782/a257d3fa-df28-416b-a6b4-6add9916f636)

### Activity Diagram

![activity drawio (1)](https://github.com/High-Voltaged/Project-resource-allocator/assets/71522782/1fc73a3a-ebb0-4fb0-bcc0-ff18af20d010)

## Physical Deployment

![activity-Deployment drawio](https://github.com/High-Voltaged/Project-resource-allocator/assets/71522782/925ec144-a5b4-4cb6-8d19-1b4256afaf0a)

## Requirements

- Node 18
- PostgreSQL 14

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
