# Note
  > KMAC -> cSHAKE -> SHAKE -> KECCAK
  > HMAC -> SHAKE -> KECCAK

  KECCAK-p[b, n<sub>r</sub>] -> {<br>
    state array A <br>
    round index i<sub>r</sub><br>
    `θ, ρ, π, χ, ι分别为5个不同的函数，在Sec 3.2.1 - 3.2.5中给出`
    Rnd(A, i<sub>r</sub>) =  ι(χ(π(ρ(θ(A)))), i<sub>r</sub>)
    
    @desc {
      input: {
        string S, `length b`,
        number n<sub>r</sub>
      }
      output: {
        string S' `length b`
      }
      step: {
        1. 将S转换为state array A,如Sec 3.1.2中的定义
        2. for (let ir = 12+2l-nr; i <= 12+2l-1;) A = Rnd(A, ir)
        3. 将A转换成长度为b的字符串S',如Sec 3.1.3中定义
        4. 返回S'
      }
    }
  }

  KECCAK-f[b] = KECCAK-p[b, 12+2l]
  KECCAK-f[1600] = KECCAP-p[1600, 24]

  KECCAK -> {
    underlying function: KECCAK-p[b, 12+2l] (Sec 3.3)
    padding rule: pad10*1 (Sec 5.1)

    rate r, capacity c
    b = r + c -> {25, 50, 100, 200, 400, 800, 1600}
  }

  KECCAK[c] -> {
    b = 1600
    KECCAK[c] = SPONGE[ KECCAK-p[1600,24], pad10*1, 1600-c ]
    KECCAK[c](N, d) = SPONGE[ KECCAK-p[1600,24], pad10*1, 1600-c ](N, d)
  }

  SHA-3 -> {
    message M
    SHA3-224(M) = KECCAK[448] (M || 01, 224)
    SHA3-256(M) = KECCAK[512] (M || 01, 256)
    SHA3-384(M) = KECCAK[768] (M || 01, 384)
    SHA3-512(M) = KECCAK[1024](M || 01, 512)
  }

