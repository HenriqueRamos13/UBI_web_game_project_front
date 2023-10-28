# Use uma imagem base adequada para um servidor da web
FROM nginx:latest

# Copie os arquivos estáticos do aplicativo para o diretório padrão do servidor da web do Nginx
COPY . /usr/share/nginx/html

# Exponha a porta 80 para o servidor da web
EXPOSE 80

# Comando para iniciar o servidor da web Nginx em segundo plano
CMD ["nginx", "-g", "daemon off;"]