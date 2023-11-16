# Stop all running containers
docker kill $(docker ps -q)

# Remove all containers (including stopped ones)
docker rm -f $(docker ps -aq)

# Remove all Docker images
docker rmi -f $(docker images -q)

# Remove all volumes
docker volume rm $(docker volume ls -q)

# Remove all networks
docker network rm $(docker network ls -q)


docker system prune -af
