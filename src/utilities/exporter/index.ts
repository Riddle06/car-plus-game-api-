import { AppError } from '@view-models/common.vm';
import * as xlsx from "xlsx";
import * as luxon from "luxon";

interface FieldNameDic {
    [key: string]: string
}

interface ExportParameter<T> {
    fieldNameDic: FieldNameDic,
    data: T[]
    fileName: string
    sheetName: string
}

export interface ExportResult {
    buffer: Buffer
    fileName: string
}

class Exporter {
    async exportByFieldDicAndData<T>(param: ExportParameter<T> = {
        data: [],
        fileName: '',
        fieldNameDic: {},
        sheetName: 'sheet1'
    }): Promise<ExportResult> {
        const { data, fileName, fieldNameDic, sheetName } = param

        let fileNameWithTimestamp = `${luxon.DateTime.local().toMillis()}-${fileName}`

        const newFieldWithData: any[] = []


        for (const d of data) {
            const newItem: any = {};

            if (Object.keys(d).length < Object.keys(fieldNameDic).length) {
                throw new AppError('欄位與資料不符合')
            }

            for (const key in d) {
                const fieldName = fieldNameDic[key] ? fieldNameDic[key] : key;
                newItem[fieldName] = d[key]
            }
            newFieldWithData.push(newItem)
        }

        if (newFieldWithData.length === 0) {
            const row = {}
            for (const field in fieldNameDic) {
                row[fieldNameDic[field]] = ''
            }
            newFieldWithData.push(row)
        }

        const sheet = xlsx.utils.json_to_sheet(newFieldWithData)
        const workbook = xlsx.utils.book_new()
        xlsx.utils.book_append_sheet(workbook, sheet, sheetName)

        const buffer = xlsx.write(workbook, {
            type: 'buffer'
        })

        return {
            buffer,
            fileName: fileNameWithTimestamp
        };
    }

}

export const exporter = new Exporter();