{{- $posts := .RegularPages -}}
# {{ .Title }}

{{ .Description }}

{{ len $posts }} posts. Machine-readable versions: [posts.json]({{ printf "%sposts/posts.json" site.BaseURL }}) · [search-index.json]({{ printf "%sposts/search-index.json" site.BaseURL }}) · [llms.txt]({{ printf "%sllms.txt" site.BaseURL }})

{{ range $posts -}}
## [{{ .Title }}]({{ .Permalink }})

- Date: {{ .Date.Format "2006-01-02" }}
- Markdown: {{ printf "%sindex.md" .Permalink }}
{{- with .Params.tags }}
- Tags: {{ delimit . ", " }}
{{- end }}
- Description: {{ .Description }}

{{ end -}}
