import numpy as np
from scipy.sparse import csr_matrix


class game:
    def get_status(self,field):
        print(field.indices)
        print(field.indptr)
        print(field.diagonal(-5))
        for player in range(1,3):
            for i in field:
                #print(type(i))
                pass
            pass
            #print(player)
        pass

field = csr_matrix(np.array([ [0, 0, 0, 0, 0, 0, 0],
                              [0, 0, 0, 0, 0, 0, 0],
                              [0, 0, 0, 0, 0, 0, 0],
                              [0, 0, 0, 0, 0, 0, 0],
                              [0, 0, 0, 0, 0, 0, 0],
                              [1, 1, 1, 1, 0, 0, 0]]))

instance = game()
instance.get_status(field)