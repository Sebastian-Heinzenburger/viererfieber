def matrix_to_crs(matrix):
    values = []
    columns = []
    crs = []

    for row_index, row in enumerate(matrix):
        amount_of_value_elements_before_row = len(values)
        for column_index, cell in enumerate(row):
            if cell != 0:
                values.append(cell)
                columns.append(column_index)