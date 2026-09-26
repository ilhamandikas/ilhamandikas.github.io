{{- if and .IsPage (eq .Section "posts") -}}
# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
- Date: {{ .Date.Format "2006-01-02" }}
- URL: {{ .Permalink }}
- Markdown: {{ printf "%sindex.md" .Permalink }}
{{- with .Params.tags }}
- Tags: {{ delimit . ", " }}
{{- end }}
- Reading time: {{ .ReadingTime }} min

{{ .RawContent }}
{{- else -}}
# {{ .Title }}

{{ .RawContent }}
{{- end -}}
