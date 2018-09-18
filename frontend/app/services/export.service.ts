import { Injectable } from '@angular/core'
import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
  HttpEventType,
  HttpErrorResponse
} from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { filter } from 'rxjs/operator/filter'
import { map } from 'rxjs/operator/map'

import { ToastrService } from 'ngx-toastr'
import { AppConfig } from '@geonature_config/app.config'


export interface Export {
  id: number
  label: string
  schema: string
  view: string
  desc: string
  geometry_field: string
  geometry_srid: number
}

export interface ApiErrorResponse extends HttpErrorResponse {
   api_error: {
      error?: string
      message?: string
      // links?: { about: string }
    }
    name: string
    message: string
    status: number
}

const apiEndpoint=`${AppConfig.API_ENDPOINT}/exports`

export const FormatMapMime = new Map([
  ['csv', 'text/csv'],
  ['json', 'application/json'],
  ['rdf', 'application/rdf+xml'],
  ['shp', 'application/zip']
])

@Injectable()
export class ExportService {
  exports: BehaviorSubject<Export[]>
  downloadProgress: BehaviorSubject<number>
  private _blob: Blob

  constructor(private _api: HttpClient, private toastr: ToastrService) {
    this.exports = <BehaviorSubject<Export[]>>new BehaviorSubject([])
    this.downloadProgress = <BehaviorSubject<number>>new BehaviorSubject(0.0)
  }

  getExports() {
    this._api.get(`${apiEndpoint}/`).subscribe(
      (exports: Export[]) => this.exports.next(exports),
      (e: ApiErrorResponse) => {
        console.error('api error:', e.api_error)
        this.toastr.error(
          e.api_error.message,
          'API Error:' + e.api_error.error, {
            timeOut: 0
          })
        console.error('error.name:', e.name)
        console.error('error.message:', e.message)
        console.error('error.status:', e.status)
      },
      () => {
        console.info(`export service: ${this.exports.value.length} exports`)
        console.debug('exports:',  this.exports.value)
      }
    )
  }

  downloadExport(xport: Export, format: string) {
    let downloadExportURL = `${apiEndpoint}/${xport.id}/${format}`
    let fileName = undefined

    let source = this._api.get(downloadExportURL, {
      headers: new HttpHeaders().set('Content-Type', `${FormatMapMime.get(format)}`),
      observe: 'events',
      responseType: 'blob',
      reportProgress: true,
    })
    let subscription = source.subscribe(
      event => {
        switch(event.type) {
          case(HttpEventType.DownloadProgress):
            if (event.hasOwnProperty('total')) {
              const percentage = Math.round((100 / event.total) * event.loaded)
              this.downloadProgress.next(percentage)
            } else {
              const kb = (event.loaded / 1024).toFixed(2)
              this.downloadProgress.next(parseFloat(kb))
            }
            break

          case(HttpEventType.ResponseHeader):
            const disp = event.headers.get('Content-Disposition')
            const fileNameMatch = disp ? /filename="?([^"]*)"?;?/g.exec(disp) : undefined;
            fileName = fileNameMatch && fileNameMatch.length > 1 ? fileNameMatch[1] : undefined;
            break

          case(HttpEventType.Response):
            this._blob = new Blob([event.body], {type: event.headers.get('Content-Type')})
            break
        }
    },
    (e: ApiErrorResponse) => {
      this.toastr.error(e.api_error.message, e.api_error.error, {timeOut: 0})
      console.error('api error:', e.api_error)
    },
    () => {
      this.saveBlob(this._blob, fileName)
      subscription.unsubscribe()
    }
  )}

  saveBlob(blob, filename) {
    let link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('visibility','hidden')
    link.download = filename
    link.onload = function() { URL.revokeObjectURL(link.href) }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
