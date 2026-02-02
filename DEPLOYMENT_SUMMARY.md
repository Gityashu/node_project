# Node.js App Deployment - Summary

## **✅ Changes Made**

### **1. Ingress Configuration** (`node-app-ingress.yaml`)

**Added comprehensive ALB load balancer attributes:**
```yaml
alb.ingress.kubernetes.io/load-balancer-attributes: |
  routing.http.xff_header_processing.mode=append,
  routing.http.xff_client_port.enabled=true,
  routing.http.preserve_host_header.enabled=true,
  routing.http.drop_invalid_header_fields.enabled=true
```

**What this does:**
- ✅ `xff_header_processing.mode=append` - Appends real IP to X-Forwarded-For
- ✅ `xff_client_port.enabled=true` - Includes client port in headers
- ✅ `preserve_host_header.enabled=true` - Keeps original Host header
- ✅ `drop_invalid_header_fields.enabled=true` - Security: drops malformed headers

---

### **2. Deployment Image** (`k8s-deployment.yaml`)

**Changed from ECR to Docker Hub:**
```yaml
# Line 61
image: nyr24/testing:latest  # ← Your Docker Hub image
```

---

### **3. GitHub Workflow** (`.github/workflows/main1.yml`)

**Updated OIDC role name:**
```yaml
role-to-assume: arn:aws:iam::${{ env.AWS_ACCOUNT_ID }}:role/OIDC-connectivity-role
```

**Updated deployment files:**
```yaml
kubectl apply -f k8s-deployment.yaml
kubectl apply -f node-app-ingress.yaml
```

---

## **🚀 Deploy Now**

```bash
# 1. Your image is already pushed to Docker Hub
# ✅ nyr24/testing:latest

# 2. Deploy to Kubernetes
kubectl apply -f k8s-deployment.yaml
kubectl apply -f node-app-ingress.yaml

# 3. Wait for deployment
kubectl rollout status deployment/node-app -n sample

# 4. Get ALB URL
kubectl get ingress node-app-ingress -n sample

# 5. Test
curl http://<alb-url>/debug/client-ip
```

---

## **📊 Verify IP Extraction**

### **Test Debug Endpoint**
```bash
# Get ALB DNS
ALB_DNS=$(kubectl get ingress node-app-ingress -n sample -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test
curl http://$ALB_DNS/debug/client-ip
```

**Expected Response:**
```json
{
  "1_RESULT_REAL_CLIENT_IP": "YOUR_REAL_IP",  ← Not 172.17.0.1!
  "3_HEADERS": {
    "x_forwarded_for_chain": ["YOUR_REAL_IP", "..."]
  }
}
```

---

## **📝 View Logs**

```bash
# Get pod
kubectl get pods -n sample

# View logs
kubectl logs -f <pod-name> -n sample | grep "IP:"
```

**You should see:**
```
GET /debug/client-ip | IP: 203.0.113.42  ← Real public IP!
GET / | IP: 203.0.113.42
```

**Not** `172.17.0.1` like in Docker!

---

## **Files Modified**

| File | What Changed |
|------|-------------|
| `node-app-ingress.yaml` | Added advanced ALB attributes |
| `k8s-deployment.yaml` | Changed image to `nyr24/testing:latest` |
| `.github/workflows/main1.yml` | Updated OIDC role + deployment files |

---

## **Next Steps**

1. **Deploy**: `kubectl apply -f k8s-deployment.yaml && kubectl apply -f node-app-ingress.yaml`
2. **Wait**: `kubectl rollout status deployment/node-app -n sample`
3. **Test**: `curl http://<alb-url>/debug/client-ip`
4. **Verify**: Check logs for real IPs (not 172.17.0.1)

Ready to deploy! 🚀
