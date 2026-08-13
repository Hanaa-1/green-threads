FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# force production mode to disable file watchers and prevent inotify errors in containers
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["GreenThreadsAPI.csproj", "."]
RUN dotnet restore "GreenThreadsAPI.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "GreenThreadsAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GreenThreadsAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GreenThreadsAPI.dll"]