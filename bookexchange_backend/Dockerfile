# base image
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# copy maven wrapper and pom
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

# copy source and build
COPY src ./src
RUN ./mvnw package -DskipTests

# run image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/backendjava-0.0.1-SNAPSHOT.jar app.jar

# env variables
ENV SERVER_PORT=5000
EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]

