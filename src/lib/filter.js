
export function filterData({ inputValue, unfilteredData }) {
    let storageArr = [];
    if (inputValue) {
        unfilteredData.forEach((data) => {
            if (
                data.Descripcion.toLowerCase().includes(
                    inputValue.toLowerCase()
                )
            ) {
                storageArr = [...storageArr, data.Descripcion];
            }
        });
    }
    return storageArr
}

