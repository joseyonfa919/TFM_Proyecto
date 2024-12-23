import psycopg2

try:
    conn = psycopg2.connect(
        dbname="DB_PRUEBAS",
        user="user_generico",
        password="UserGenerico",
        host="localhost",
        port="5432",
        options="-c client_encoding=UTF8"
    )
    print("Conexión exitosa a PostgreSQL")
    conn.close()
except Exception as e:
    print(f"Error al conectar a PostgreSQL: {e}")
