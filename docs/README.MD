# Analyzecore Example Using Matrices
Using the matrix translation is not significantly different up to the point where you have a table of probabilities.  From that point, you’ll want to create what is known as a stochastic matrix from your probability table.  A stochastic matrix based on the channel data used in the example would look something like the below.  Note (ST = start state, NL = Null state, CV = conversion state, values have been truncated for representation purposes):

```
  ST  C1  C2  C3  NL  CV
ST 0 .66 .33   0   0   0
C1 0   0 .50   0 .50   0
C2 0   0   0   1   0   0
C3 0   0   0   0 .50 .50
NL 0   0   0   0   1   0
CV 0   0   0   0   0   1
```

From this point forward, unless necessary, matrices will be represented as latex images:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%200%20%26%20.66%20%26%20.33%20%26%200%20%26%200%20%26%200%5C%5C%200%20%26%200%20%26%20.50%20%26%200%20%26%20.50%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%201%20%26%200%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%200%20%26%20.50%20%26%20.50%5C%5C%200%20%26%200%20%26%200%20%26%200%20%26%201%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%200%20%26%200%20%26%201%20%5Cend%7Bbmatrix%7D)




In this example, ST, C1, C2 and C3 are all known as transition states (t).  This means that there is a chance they’ll move on to another state at the next iteration.  The opposite of this are NL and CV.  These are known as absorption states(r).  Once someone is in this state, they will not come back.  We’ve arranged the matrix such that the starting channel is the first row/column and the two absorption states are in the last rows/columns.  Now we can subdivide our matrix into four sub matrices like so:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%20Q%20%26%20R%5C%5C%200%20%26%20I%20%5Cend%7Bbmatrix%7D)

Q will be a matrix with columns and rows equal to the transition states (t) like so:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%200%20%26%20.66%20%26%20.33%20%26%200%5C%5C%200%20%26%200%20%26%20.50%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%201%5C%5C%200%20%26%200%20%26%200%20%26%200%20%5Cend%7Bbmatrix%7D)

R will be a matrix with columns equal to the absorptions states(r) and rows equal to the transition states (t) like so:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%200%20%26%200%5C%5C%20.50%20%26%200%5C%5C%200%20%26%200%5C%5C%20.50%20%26%20.50%20%5Cend%7Bbmatrix%7D)

0 will be a t x r matrix of all zeros like so:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%200%20%26%200%20%26%200%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%200%20%5Cend%7Bbmatrix%7D)

I will be an r x r matrix in the form of an identity matrix like so:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%201%20%26%200%5C%5C%200%20%26%201%20%5Cend%7Bbmatrix%7D)

Once you’ve established these new matrices, we can derive a few others using textbook matrix math.  First, we have the fundamental matrix (N), which is expressed as

![](https://latex.codecogs.com/svg.latex?%5Cinline%20N%20%3D%20%28I_%7Bt%7D%20-%20Q%29%5E%7B-1%7D)

Where ![](https://latex.codecogs.com/svg.latex?%5Cinline%20I_%7Bt%7D) is the identity matrix of t x t rows/columns and Q is the Q sub matrix.  Using that to our example would look something like

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%28%5Cbegin%7Bbmatrix%7D%201%20%26%200%20%26%200%20%26%200%5C%5C%200%20%26%201%20%26%200%20%26%200%5C%5C%200%20%26%200%20%26%201%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%201%20%5Cend%7Bbmatrix%7D%20-%20%5Cbegin%7Bbmatrix%7D%200%20%26%20.66%20%26%20.33%20%26%200%5C%5C%200%20%26%200%20%26%20.50%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%201%5C%5C%200%20%26%200%20%26%200%20%26%200%20%5Cend%7Bbmatrix%7D%20%29%5E%7B-1%7D%20%3D%20%5Cbegin%7Bbmatrix%7D%201%20%26%200.66%20%26%200.66%20%26%200.66%5C%5C%200%20%26%201%20%26%200.50%20%26%200.50%5C%5C%200%20%26%200%20%26%201%20%26%201%5C%5C%200%20%26%200%20%26%200%20%26%201%20%5Cend%7Bbmatrix%7D)

The fundamental matrix has all sorts of interesting properties, one of which is that you can use it to derive the absorption probabilities for the matrix(M).  This can be expressed as   

![](https://latex.codecogs.com/svg.latex?%5Cinline%20M%20%3D%20NR)

Using our example data, and the value for N above, we get the following value for M (I’m filling in the row/col values so you can understand what it lines up to):

```
     NL    CV
ST 0.66  0.33
C1 0.75  0.25
C2 0.50  0.50
C3 0.50  0.50
```

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%200.66%20%26%200.33%5C%5C%200.75%20%26%200.25%5C%5C%200.50%20%26%200.50%5C%5C%200.50%20%26%200.50%20%5Cend%7Bbmatrix%7D)


M tells us the absorption probabilities for any absorption state when starting from any transient state.  For our example, we only need the top row, because we always start from the start state.  Also for our example, we only need the second column, because we care about the probability of conversion.  So the probability of reaching conversion state from the start state is 1/3 (.33 above).  You’ll notice, that this agrees with the answer that Sergey got for his probability of conversion for the whole graph.  Another interesting thing you can get from the M matrix is how likely people are to convert from any state at any time.  Based on this probability matrix, we can conclude that channels C2 and C3 should be favored in a marketing mix because they are higher probability for a customer to convert eventually.  

To calculate the removal effect, the above exercise is simply repeated after removing each channel from the graph.  For example, the stochastic matrix for removal of channel C1 would be:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%200%20%26%200.33%20%26%200%20%26%200.66%20%26%200%5C%5C%200%20%26%200%20%26%201%20%26%200%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%200.5%20%26%200.5%5C%5C%200%20%26%200%20%26%200%20%26%201%20%26%200%5C%5C%200%20%26%200%20%26%200%20%26%200%20%26%201%20%5Cend%7Bbmatrix%7D)

And fundamental matrix N would be:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%201%20%26%200.33%20%26%200.33%5C%5C%200%20%26%201%20%26%201%5C%5C%200%20%26%200%20%26%201%20%5Cend%7Bbmatrix%7D)

And the absorption probability matrix M would be:

![](https://latex.codecogs.com/svg.latex?%5Cinline%20%5Cbegin%7Bbmatrix%7D%200.833%20%26%200.166%5C%5C%200.5%20%26%200.5%5C%5C%200.5%20%26%200.5%20%5Cend%7Bbmatrix%7D)

As you can see, again, we match values with what Sergey got for his answer, 1/6 (.166 above).  From this point, the calculation proceeds in the exact same manner as described in the original post.  
