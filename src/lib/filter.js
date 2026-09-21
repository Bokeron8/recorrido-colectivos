
export function filterData({ inputValue, unfilteredData }) {
    let storageArr = [];
    if (inputValue) {
        unfilteredData.forEach((data) => {
            if (
                data.descripcion.toLowerCase().includes(
                    inputValue.toLowerCase()
                )
            ) {
                storageArr = [...storageArr, data.descripcion];
            }
        });
    }
    return storageArr
}

