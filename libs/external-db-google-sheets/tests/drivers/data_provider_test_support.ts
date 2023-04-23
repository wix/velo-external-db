
import axios from 'axios'
import { PORT } from '../e2e-testkit/google_sheets_resources'

const axiosClient = axios.create({
    baseURL: `http://localhost:${PORT}/v4/spreadsheets/`
})

export const addItemsToCollection = async(sheetTitle:any, items: any) => {
    return await axiosClient.post('/test/add_data', {
        sheetTitle,
        items
    })       
}
