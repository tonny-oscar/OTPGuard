import multiprocessing
import os

# ── Server socket ─────────────────────────────────────────────────
bind    = f"0.0.0.0:{os.getenv('PORT', '5000')}"
backlog = 2048

# ── Workers ───────────────────────────────────────────────────────
# 2-4 workers per CPU core is the standard recommendation
workers     = int(os.getenv('GUNICORN_WORKERS', multiprocessing.cpu_count() * 2 + 1))
worker_class = 'sync'
threads     = 1
timeout     = 120
keepalive   = 5

# ── Logging ───────────────────────────────────────────────────────
accesslog  = '-'   # stdout
errorlog   = '-'   # stderr
loglevel   = os.getenv('LOG_LEVEL', 'info')
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sms'

# ── Process naming ────────────────────────────────────────────────
proc_name = 'otpguard'

# ── Security ──────────────────────────────────────────────────────
limit_request_line   = 4096
limit_request_fields = 100

# ── Lifecycle hooks ───────────────────────────────────────────────
def on_starting(server):
    server.log.info("OTPGuard backend starting...")

def worker_exit(server, worker):
    server.log.info(f"Worker {worker.pid} exited")
