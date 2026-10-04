{{- if .Params.tool_guides_index -}}
# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
- URL: {{ .Permalink }}
- Topic guides: {{ "guides/" | absURL }}

{{- $pages := site.RegularPages -}}
{{- range site.Data.tools }}

## {{ .name }}

{{- range .tools }}
{{- $slug := .slug -}}
{{- with where $pages "Params.tool_guide_slug" $slug }}
{{- range . }}
- [{{ .Title }}]({{ .Permalink }}) — {{ .Description }}
{{- end }}
{{- end }}
{{- end }}
{{- end -}}
{{- else if .Params.topic_guides_index -}}
# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
- URL: {{ .Permalink }}
- Tool notes: {{ "guides/tools/" | absURL }}

{{- $topicGuides := slice -}}
{{- range site.RegularPages -}}
  {{- if and (eq .Section "guides") (not .Params.tool_guide_slug) (not .Params.tool_guides_index) (not .Params.topic_guides_index) -}}
    {{- $topicGuides = $topicGuides | append . -}}
  {{- end -}}
{{- end }}
{{- range sort $topicGuides "Title" }}
- [{{ .Title }}]({{ .Permalink }}) — {{ .Description }}
{{- end -}}
{{- else -}}
{{- with .Params.tool_guide_slug -}}
{{- $slug := . -}}
# {{ $.Title }}

{{ with $.Description }}{{ . }}

{{ end -}}
- Tool: {{ printf "%stools/%s/" site.BaseURL $slug }}
- Guide URL: {{ $.Permalink }}
- Tool guides index: {{ "guides/tools/" | absURL }}
{{- with $.Params.broader_guide }}
- Broader guide: {{ .title }} ({{ .url | absURL }})
{{- end }}

{{ $.RawContent }}
{{- with $.Params.faq }}

## Questions you might have
{{- range . }}

### {{ .q }}

{{ .a }}
{{- end }}
{{- end }}
{{- else -}}
# {{ $.Title }}

{{ $.RawContent }}
{{- end -}}
{{- end -}}
