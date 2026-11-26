FROM mysql:8.0

# Variáveis padrão — sobrescrever em docker run / compose
ENV MYSQL_ROOT_PASSWORD=change_me
ENV MYSQL_DATABASE=roadvizor
ENV MYSQL_USER=roadvizor_user
ENV MYSQL_PASSWORD=sptech

# Copiar script de inicialização (contexto de build deve ser a raiz do repo)
# Observação: o script original está em "Site-institucional/src/database/script-tabelas.sql"
COPY Site-institucional/src/database/script-tabelas.sql /docker-entrypoint-initdb.d/01-init.sql

EXPOSE 3306
VOLUME ["/var/lib/mysql"]
CMD ["mysqld"]
