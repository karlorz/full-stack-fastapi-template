{{/*
Generate a Deployment resource.

Expects a list with:
- key of the application (example: "api")
- context (example: .)
*/}}
{{- define "fastapicloud.resource.deployment" -}}
{{- $key := index . 0 }}
{{- $ctx := index . 1 }}
{{- $app := index $ctx.Values $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "fastapicloud.fullname" $appCtx }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
spec:
  {{- if not (default false $app.autoscaling.enabled) }}
  replicas: {{ $app.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "fastapicloud.selectorLabels" $appCtx | nindent 6 }}
  template:
    metadata:
      {{- with $app.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "fastapicloud.labels" $appCtx | nindent 8 }}
        {{- with $app.podLabels }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    spec:
      {{- with $app.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "fastapicloud.serviceAccountName" $appCtx }}
      {{- with $app.podSecurityContext }}
      securityContext:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      containers:
        - name: {{ $ctx.Chart.Name }}
          {{- with $app.securityContext }}
          securityContext:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          image: "{{ $app.image.repository }}:{{ $app.image.tag | default $ctx.Chart.AppVersion }}"
          imagePullPolicy: {{ $app.image.pullPolicy }}
          {{- with (default (dict) $app.ports) }}
          ports:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with $app.livenessProbe }}
          livenessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with $app.readinessProbe }}
          readinessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with $app.resources }}
          resources:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with $app.volumeMounts }}
          volumeMounts:
            {{- toYaml . | nindent 12 }}
          {{- end }}
      {{- with $app.volumes }}
      volumes:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with $app.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with $app.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with $app.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
{{- end }}
