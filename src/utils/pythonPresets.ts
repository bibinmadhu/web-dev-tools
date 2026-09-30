export interface PythonPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  urlCount: number;
  code: string;
}

export const PYTHON_PRESETS: PythonPreset[] = [
  {
    id: 'api-client-service',
    name: 'REST API Client & Webhook Service',
    description: 'Cloud microservice client with authentication, multiple endpoints, retry logic and webhooks',
    badge: 'API & Webhooks',
    urlCount: 4,
    code: `import json
import time
import requests
from typing import Dict, Any, Optional

class CloudApiClient:
    """Enterprise client for interacting with distributed cloud services."""

    BASE_API_URL = "https://api.cloudservice.internal:8443/v2/services"
    AUTH_ENDPOINT = "https://auth.security.cloudservice.internal/oauth/token"
    SLACK_WEBHOOK = "https://hooks.slack.com/services/T0123/B4567/890abcdef123456"
    TELEMETRY_INGEST = "https://telemetry.analytics.global/collect/v1/metrics"

    def __init__(self, client_id: str, client_secret: str, max_retries: int = 3):
        self.client_id = client_id
        self.client_secret = client_secret
        self.max_retries = max_retries
        self.access_token: Optional[str] = None
        self.session = requests.Session()

    def authenticate(self) -> bool:
        """Authenticate against OAuth2 server and fetch bearer token."""
        payload = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }
        response = self.session.post(self.AUTH_ENDPOINT, json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get("access_token")
            return True
        self._notify_alert(f"Authentication failed: {response.status_code}")
        return False

    def fetch_user_data(self, user_id: str) -> Dict[str, Any]:
        """Fetch protected resource from base API URL."""
        if not self.access_token:
            self.authenticate()

        target_url = f"{self.BASE_API_URL}/users/{user_id}/profile"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        for attempt in range(self.max_retries):
            try:
                res = self.session.get(target_url, headers=headers, timeout=5)
                if res.status_code == 200:
                    self._send_telemetry("fetch_success", 1)
                    return res.json()
            except requests.RequestException as err:
                time.sleep(2 ** attempt)

        self._notify_alert(f"Failed to fetch user {user_id} after {self.max_retries} attempts")
        return {}

    def _notify_alert(self, message: str) -> None:
        """Send urgent notification to Slack webhook."""
        alert_payload = {"text": f"[ALERT] {message}", "timestamp": time.time()}
        try:
            self.session.post(self.SLACK_WEBHOOK, json=alert_payload, timeout=5)
        except Exception:
            pass

    def _send_telemetry(self, metric_name: str, value: float) -> None:
        """Log runtime telemetry to metrics aggregator."""
        metric_body = {"metric": metric_name, "value": value}
        try:
            self.session.post(self.TELEMETRY_INGEST, json=metric_body, timeout=3)
        except Exception:
            pass`,
  },
  {
    id: 'data-scraper-pipeline',
    name: 'Data Pipeline & Scraper Service',
    description: 'Scrapes open data catalogs, downloads datasets and pushes structured records',
    badge: 'Scraper / ETL',
    urlCount: 3,
    code: `import urllib.request
import json
import re

class DataCatalogIngestion:
    CATALOG_INDEX_URL = "https://data.gov/catalog/api/v1/datasets"
    GEO_DATASET_URL = "https://download.geospatial.org/raw/2026/boundaries.geojson"
    WAREHOUSE_INGEST_URL = "https://ingest.datawarehouse.internal/api/stream"

    def __init__(self, environment: str = "production"):
        self.environment = environment
        self.processed_records = 0

    def download_catalog_index(self) -> list:
        req = urllib.request.Request(
            self.CATALOG_INDEX_URL,
            headers={"User-Agent": "DevHub-DataPipeline/2.0"}
        )
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return json.loads(content).get("datasets", [])

    def fetch_geospatial_layers(self) -> dict:
        print(f"Downloading layers from {self.GEO_DATASET_URL}")
        with urllib.request.urlopen(self.GEO_DATASET_URL) as response:
            return json.loads(response.read().decode('utf-8'))

    def push_to_warehouse(self, record_batch: list) -> bool:
        data_bytes = json.dumps({"records": record_batch}).encode('utf-8')
        request = urllib.request.Request(
            self.WAREHOUSE_INGEST_URL,
            data=data_bytes,
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(request) as res:
                if res.status == 200:
                    self.processed_records += len(record_batch)
                    return True
        except Exception as error:
            print(f"Ingestion error: {error}")
        return False`,
  },
  {
    id: 'auth-jwt-verifier',
    name: 'OAuth2 & JWT Security Verifier',
    description: 'Validates tokens against public keys, parses claims and manages revocation list',
    badge: 'Security / Auth',
    urlCount: 3,
    code: `import base64
import json
import time

class JwtSecurityVerifier:
    JWKS_PUBLIC_KEYS_URL = "https://identity.company.com/.well-known/jwks.json"
    REVOCATION_LIST_URL = "https://auth.company.com/api/v1/revocations/active"
    AUDIT_LOGGER_URL = "https://audit.security.internal/log/auth_event"

    def __init__(self, expected_issuer: str, audience: str):
        self.expected_issuer = expected_issuer
        self.audience = audience
        self.cached_keys = {}

    def fetch_public_keys(self) -> dict:
        """Fetch RSA public keys from remote JWKS URL."""
        # Simulated key fetching from JWKS_PUBLIC_KEYS_URL
        return {"keys": [{"kid": "rsa-key-1", "use": "sig"}]}

    def check_is_revoked(self, jti: str) -> bool:
        """Check if JWT ID is in remote revocation list."""
        # Queries REVOCATION_LIST_URL
        return False

    def log_verification_audit(self, user_id: str, success: bool) -> None:
        """Log authentication event to secure audit endpoint."""
        audit_event = {
            "user_id": user_id,
            "success": success,
            "timestamp": time.time(),
            "destination": self.AUDIT_LOGGER_URL
        }
        # Dispatches event payload
        return None`,
  },
  {
    id: 'payment-processor',
    name: 'Payment Gateway Integration',
    description: 'Processes credit cards, captures charges, handles webhook callbacks and refunds',
    badge: 'Fintech / Gateway',
    urlCount: 4,
    code: `class PaymentGatewayService:
    CHECKOUT_API = "https://api.stripe.com/v1/charges"
    REFUND_ENDPOINT = "https://api.stripe.com/v1/refunds"
    FRAUD_DETECTION_SERVICE = "https://risk-ai.fraudshield.internal/v2/evaluate"
    WEBHOOK_CONFIRMATION = "https://billing.myapp.com/webhooks/payment_completed"

    def __init__(self, api_key: str, merchant_id: str):
        self.api_key = api_key
        self.merchant_id = merchant_id

    def assess_risk_score(self, card_fingerprint: str, amount_cents: int) -> float:
        """Query fraud detection service before charging card."""
        endpoint = self.FRAUD_DETECTION_SERVICE
        # Simulated risk evaluation
        return 0.12

    def charge_customer(self, customer_id: str, amount_cents: int, currency: str = "USD") -> dict:
        risk = self.assess_risk_score(customer_id, amount_cents)
        if risk > 0.75:
            raise ValueError("Transaction flagged as high risk by FraudShield")

        request_url = self.CHECKOUT_API
        # Execute charge against CHECKOUT_API
        transaction_id = "txn_987654321"
        self._notify_webhook(transaction_id, amount_cents)
        return {"status": "succeeded", "transaction_id": transaction_id}

    def _notify_webhook(self, transaction_id: str, amount: int) -> None:
        callback = self.WEBHOOK_CONFIRMATION
        # POST confirmation to billing webhook
        pass`,
  },
];
