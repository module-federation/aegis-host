<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="aegis-logo.png" />

    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
      crossorigin="anonymous"
    />

    <title>ÆGIS Domain Model API</title>
  </head>

  <body class="bg-dark">
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
      crossorigin="anonymous"
    ></script>

    <nav class="navbar navbar-dark bg-dark" aria-label="navbar">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <img src="aegis-logo.png" alt="aegis" width="65" height="65" />
          <span
            class="navbar-brand mb-0 text-warning h1 navbar-toggler"
            data-bs-toggle="collapse"
            data-bs-target="#navbarsExample01"
            aria-controls="navbarsExample01"
            aria-expanded="false"
          >
            <span class="text-warning"><b>ÆGIS</b></span>
            <span class="text-white"> Domain Model API</span>
          </span>
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarsExample01"
          aria-controls="navbarsExample01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarsExample01">
          <ul class="navbar-nav me-auto mb-2">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="wsapp.html"
                >Service Mesh</a
              >
            </li>
            <li class="nav-item">
              <a
                cccc
                class="nav-link active"
                aria-current="page"
                href="aegis/api/config?details=threads&html=true"
                >Thread Pools</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="aegis/api/config?html=true"
                >Models</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="aegis/api/config?details=data&html=true"
                >Data</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="aegis/api/config?details=relations&html=true"
                >Relations</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="aegis/api/config?details=events&html=true"
                >Events</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="aegis/api/config?details=ports&html=true"
                >Ports</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link active"
                aria-current="page"
                href="aegis.config.json"
                >Config</a
              >
            </li>
            <li class="nav-item">
              <a class="nav-link" href="hot-reload.html">
                <span class="navbar-link text-light mb-0">Reload</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="aegis.log">
                <span class="navbar-link text-light mb-0">Log</span>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                href="https://github.com/module-federation/aegis"
                target="_blank"
                rel="noopener"
              >
                <span class="navbar-link text-light mb-0">Source</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="arch.html">
                <span class="navbar-link text-light mb-0">Architecture</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="container-fluid bg-dark">
      <div class="row">
        <div class="col-md-5">
          <div class="progress collapse mb-3" id="progresscntrl">
            <div
              class="progress-bar progress-bar-striped progress-bar-animated bg-warning"
              role="progressbar"
              aria-valuenow="10"
              aria-valuemin="0"
              aria-valuemax="100"
              style="width: 10%; color: black"
              id="progressbar"
            >
              hot deployment running...
            </div>
          </div>
          <div class="form-floating mb-3 input-group">
            <input
              class="form-control bg-dark text-white"
              id="model"
              list="modelList"
              placeholder="Type to search..."
            />
            <label for="model" class="form-label text-white">Model</label>
            <datalist id="modelList"></datalist>
            <button
              class="btn btn-outline-light"
              type="button"
              id="reloadModelButton"
              title="Deploy the latest code."
            >
              Load
            </button>
            <button
              class="btn btn-outline-light"
              type="button"
              id="clearModelButton"
            >
              Clear
            </button>
          </div>

          <div class="form-floating mb-3 input-group">
            <input
              class="form-control bg-dark text-white"
              id="modelId"
              placeholder="Model ID"
            />
            <label for="modelId" class="form-label text-white">Model ID</label>
            <button class="btn btn-outline-light" type="button" id="copyButton">
              Copy
            </button>
            <button
              class="btn btn-outline-light"
              type="button"
              id="clearIdButton"
            >
              Clear
            </button>
          </div>

          <div class="form-floating mb-3 input-group">
            <input
              type="text"
              class="form-control bg-dark text-white"
              list="paramList"
              id="parameter"
              placeholder="approve"
            />
            <label for="parameter" class="form-label text-white"
              >Parameter</label
            >
            <datalist id="paramList">
              <option value="approve">Checkout</option>
              <option value="cancel"></option>
              <option value="serviceMeshNotify"></option>
              <option value="serviceMeshListen"></option>
            </datalist>
            <button
              class="btn btn-outline-light"
              type="button"
              id="clearParamButton"
            >
              Clear
            </button>
          </div>

          <div class="form-floating mb-3 input-group">
            <input
              type="text"
              class="form-control bg-dark text-white"
              list="queryList"
              id="query"
              placeholder="command=decrypt"
            />
            <label for="query" class="form-label text-white">Query</label>
            <datalist id="queryList">
              <option value="command=decrypt"></option>
              <option value="command=runFibonacci"></option>
              <option value="command=decrypt&html=true"></option>
              <option value="html=true"></option>
              <option value="relation=customer"></option>
              <option value="relation=orders"></option>
              <option value="relation=inventory"></option>
              <option value="relation=customer&html=true"></option>
              <option value="count=all"></option>
              <option value="count=today"></option>
              <option value="count=1"></option>
              <option value="count=orderStatus:PENDING"></option>
              <option value="orderStatus=PENDING"></option>
            </datalist>
            <button
              class="btn btn-outline-light"
              type="button"
              id="clearQueryButton"
            >
              Clear
            </button>
          </div>

          <div class="form-floating mb-3 input-group">
            <input
              class="form-control bg-dark text-white"
              id="port"
              list="portList"
              placeholder="Type to search..."
            />
            <label for="port" class="form-label text-white">Port</label>
            <datalist id="portList"></datalist>
            <button
              class="btn btn-outline-light"
              type="button"
              id="clearPortsButton"
            >
              Clear
            </button>
          </div>

          
          <div class="form-floating mb-3">
            <textarea
              class="form-control bg-dark text-white overflow-auto"
              style="height: 120px; white-space: pre"
              placeholder="{}"
              id="payload"
            >
            {
              "firstName":"Alan",
              "lastName":"Turing",
              "userName":"enigma",
              "password":"s3cr3t",
              "email":"al@snail-mail.co",
              "creditCardNumber":"378282246310005",
              "shippingAddress":"Bletchley, Milton Keynes MK3 6EB, UK",
              "billingAddress":"Bletchley, Milton Keynes MK3 6EB, UK",
              "orderItems": [ 
                { "itemId": "item1", "price": 329.95 },
                { "itemId": "item2", "price": 59.00, "qty": 4 }
              ],
              "key1":"val1",
              "key2":"val2",
              "fibonacci":"20",
              "saveShippingDetails":false,
              "customerId":null,
              "price":99.95,
              "quantity":2,
              "desc":"item description"
            }</textarea
            >
            <label for="payload" class="text-white">Payload</label>
          </div>

          <div class="mb-sm-1">
            <button id="post" class="btn btn-outline-light" title="post">
              Post
            </button>
            <button id="patch" class="btn btn-outline-light" title="patch">
              Patch
            </button>
            <button id="get" class="btn btn-outline-light" title="get">
              Get
            </button>
            <button id="delete" class="btn btn-outline-light" title="delete">
              Delete
            </button>
            <button id="clear" class="btn btn-outline-light" title="clear">
              Clear
            </button>
          </div>
        </div>

        <div class="col-md-7">
          <input 
            type="text" 
            class="bg-dark text-warning text-decoration-underline mb-3 border-0" 
            style="width:80vw"
            id="url"
          ></>
          <pre
            id="messages"
            class="text-light mb-3 overflow-scroll"
            style="height: 80vh"
            hover="postion: relative; width: 700px; z-index: 99"
          >
          <code id="jsonCode"></code>
        </pre>
        </div>
      </div>
      <iframe frameborder="0" style="width:100%;height:1053px;" src="https://viewer.diagrams.net/?highlight=0000ff&edit=_blank&nav=1&title=#R7V1bc%2BI4Fv41VO0%2BJOULNuQxgaS7a7q7sk1qZvdRGAGeGMsjixDm16%2ButnwBTGLAmSh9iSXLkiyd852bJPfc0er1CwbJ8geawajnWLPXnjvuOY7j2Rb9xXK2ImdgOyJjgcOZyLLzjEn4N5SZ8rnFOpzBtFCQIBSRMClmBiiOYUAKeQBjtCkWm6Oo2GoCFrCSMQlAVM39I5yRpcgdelae%2FxWGi6Vq2bbknSkInhcYrWPZXs9x7332R9xeAVWXLJ8uwQxttCz3vueOMEJEXK1eRzBiY6uG7fX32fDP8c8x%2FM9w%2BvLwxRp8%2B4GvRGUPxzySvSGGMWm3ajnVLyBaQzUK%2FF3JVo0vHyHIKrF67t1mGRI4SUDA7m4oRdG8JVlFNGXTy0UE0lQWTQlGz9mcsLvzMIpGKEKYpmMU0yruGr6aHIIXiAl81eZdvuoXiFaQ4C0tIu9e2b4v503StZrGTU4kg4HMW%2BoEYinSAZIyF1nt%2BfDSCznCPImmfzLapm8S0aFZUhqGuET%2B%2FZ9gpcZ45PaG%2FpdvE9ZIknwBsaqdFnvaJrLYZJsSuJoEKIF3bBJAXug2SaIwACREsSyL5mRDR5HeFY%2BJkhGYwkhNrB8RNgkoJoUZ9v9aI3XjKuX8fUsL2H7ymt%2BkVwv5m9cyLWfMwpfaWul8kSsQhYtYVBvBOamr1pMD5HiqRjrEvNJiOzS30jbNE2%2FVapc80St9qGnnvPGu%2FrHxHsM0wGGSz4vI3suDrkbIkmdr2c%2BWcyQh2LYPs%2BMMpMvsWYAD%2Bahj1TOj4FiVSfHQ5z%2ByXS1f%2FNB8Tl93GZCW6pNjPOYD7N4x7qUjGd3K7CkiBK2yWhCmTFPuEX21MF48oUSBishgr2TJF3wEhEDMKhzSoevTXMqt4H4WEvniGBFAwJSPKHsogTikRSBrB1O2BfEigo955l2Mvku%2BsVTvHsFsJtq1%2BItFaHOrhBfLkdJNawW%2BJiBWsEmbWeM0fIG%2FoOAwUYT2UT7B%2BpmgMKYduH%2BhWKjqBdMURWsCb7PJy0pyfPEYnVrXjGtGFv%2FHCHTEM%2BvyBtVMm6VUDcXMuryBV1elXdN2Oc%2BpyaytsqZtq9RJ%2BveQtDmhaLFKokWpTJpsycSPLlt8d3i0aKFJKV0aS5pchOiSZgLxSxgwCfEDpktVdkQ5G4QxFJzt5EklL2l1MFjGlC8X8nXh9eKa3rilrLhk1f0G5s%2BATZNjQRJcq8cqWKhnOBaaMyULpinT76g2tk6Z5sh6znXFrBcYUQZxHjBMExSn4TSMQrK9Pp948%2BR4FgTTTnFTlB3aaHq8WR%2BsGETH0zTJKs9Hd694kR3D%2B5o9dgzsfWMgawky2M8LZopyrRwvzPOhUauTonvFZX%2BvuKRKOqf9YBuFVG5iJqQk4toeHy2G%2BIIkU7Rm3HpIiE6FBP4%2BVRlFjXi%2FCNSlLBOo7t39g1MS5CqtlZvzH02EBjAWsqkio637wfh2XJV6FRnRPvK3jeeYCUdNhJ4Owb0Sgg9vBtf9fgXEnX6dgeAcbx%2BcGcRXFCoh516D4QbDu4fhnsFwg%2BHvxnC3hOHDs2J4Mwebf9jBBmcLOJFJhMkSLVAMovs8Vyfk44aTcgcO4J5yA1GOALyA%2B%2BrrywpZX%2FfODoYRINTOLQizlh1p9ZIRJMkDmOIw2GnZHJaKen0bOJ1sQhIshVT8efs0EVdFUblTUuaSesUltRVEIW%2F9IaV3mDhhNaQwml%2FNEV4x54JjxZBsEH5mopUWicDWyMjPKiMHRkYaGfluGVkKggwHfqeMnDwmMhGiyrFGaMZ%2B%2FYIJSkOCagMjebADMfNiQosJC0SPfdRgsl6pMF7mkPYKEErlDAFyCZGq7vAGplsCA94vjvrCdvoSkuV6KrIo%2BUOO5jmy%2F%2FY7exlhXhVkxZnAvBpNOSpuUgR4JRk%2BCGwH%2FOcisD3cC9vFaM4BQD4KcYejYf%2BmJlSzG2HzeJCdO9C1JweuPxg6VcAto5cJRnBQPx2IU4TuurPK4LjB8X8Wjt8YHDc43jKOuyUcP6%2FDyuC4wfHPh%2BO2ZYDcAPknBvL7V7Y6DnC6l2hsxRyL9sD4AdyuiQJDrZm8HtHieSO9BmgvA7S2AVoDtC27r%2FteAWiVN7sz4V218FOL7wYoTtcrmPa6FOe13V6zQK8rI8KdCPQaIWaE2JmF2DGbMYwQM0KsiRDzikLMO58Qe%2Fu2tHz1yu0MJIziKkirLaipX00j%2FTKTBIvFLVmdzQFZdwF1YBHpSVCZ96KrS2ROj7j71%2FOfDnELS1SORFy%2FDnAda%2BiPbgzgdgBw7QLgOr79ARD3kdoEBm4N3J4YbvcvvTdwa%2BD2%2BDWGJbj1DNwauDVwy9nJN3Br4PZTwW397pwHbV3HjzDAKC3C5RuOIdCrH6MVLc7qFudb7cDgb5TbEkj%2Fi0nEBpWmIrTl1MvaoczqcmeavgoF6Oe%2F6IU09M7yzorXZrtO2XN8we06drP9Okv4ChaMHNVuHa98Io0skZ1H4xyWDPPwFaqT2Yobd94nN8zGnYtt3MmOK5Ng11eRUB3lrTqUHxiUNyhvUP5EKL9%2Fe88HQXnLAH13gL50ikHf7RbQG%2B%2BJ8Z5czHtyqU04xnvyT%2FWeZJ6RLDbodMp7YuDWwO2l4FY71dzArYHbVuDWK8Gtdz64bXgCvnqrjp7QpbrzsVZut%2BQeOiDVWvYNsV2hCZ1fPRVtFxHFYZGCmJ3UBWKZTtmh3syntI5Dkupyck1g5tIybqLP5yYSTPvR3UTGR9QVH1HJaOk75%2FMRNZSibkWK4nW8fw%2BUpDmNdOFrSP7LRvPa41%2BXYOn%2F9dTnFEIyftUTWy2hfb3hDXNxWAg3PSfTbl0Iy0cfGX%2FoNGE7wwJN%2BIPSpwXES8nnSrOddaSOABrOeL8y45TZIVi9c%2BMbZN%2FCkUSgkhkNsEROBDy11VPvI4PDKpZ1ptm9KanNXt8p1iG6WpncWjop7lUfDK3z0olXoZNpGM%2FeSyUSKWwdJQTBHIUTGbXZBVrLSe901NYi6NychCxvMWbnz2YFpIjeg0mWVcSkgWSYndR5M7De94ArzaOcaEWvd%2FXQtUuM5TVjrNa4we8QOmbi9p1MdCm6b%2F9Q6gN035wa3u7qlTaycLx%2BRWlu%2FGre3sxiq7eLvz49PUonrzr9qFBt4ZNmhUYq9vIjRi%2F8%2B46O9TfEiFnMaBOTcCUtZJkZxikBjPxZHjVJwhnPzGztzNJeiQRhD4F4W7CXE0pWfJ74lymmVJ0AAberqaZ4NV%2FH%2FDxjvjk7QHEAMdMvrTk%2FEIp%2F1JFKGvYJCjoyKbtDx4MdBm5xr8CSvqQ8VGoGjaf6M9vm%2BxfqHeXl1u3io61rz7l1xsNjrOlDW753GdfG7X32KGPJOPPPd%2Bx2Q0VkWFHLW9NM%2Brav6yb2tWVlGW%2FST6777k1BR5EVXlJLsftNtfPWtZQddNBw4m8qE7%2F3xBr5JUx9qiu4VP6w5yqczTh97AeeI3gwI9cyE2bflZat9JxCFLPKnJR4vH7RJJYVvdVoV0XQfJ7CI62GT34mp8qSPTLHdF5WK7vgwTuuOabTaGGta2GlYzoHHfxAmFtdf3CJE%2BROH7Bwb4quN9tt5oiuq2pYrCqbwXd78d58Kl1RqLYghssPptmDurSUYnbGvm8OUikypxEKnoMlXw4xyiRuJLwiyo9ipOtnkq6Oka5GurYrXT3fK4CwwuDuSNbqmoQWI4%2FFoInTXuhx8LFij%2F1z6Q%2FlpaSDMh3t0B%2BOD2M6JfXCv%2FEPKCTlJ1x5JkNtWLKtWKI6hL6rK1fdpjSk%2Bt0RD5nagKeNaxi%2FUCnUZQdZRgxtOMhuvJuiqt67mIOs4ZR1%2FDPLjVmh3zqctnL89in2IrEoNkZRxNrltsiYGjFiJNOdVtG3VRJBFkNmpgzoifXajDoYo82B8EbyLUsxu4Qx81kC8X8v%2FwSzNKmyM275I2TJL%2BkvdpNHqGEsTw0I0GpFDScVMp9CsoEwf6h4ekCAuNkmmpW1rkkacp%2FtBuFoxt8fRBF%2FC97dJItt573SXyoUS8vjebhYYzgzEezTWnOnt8hajEKbvVbGIGNKqF%2F2ijlds8haDzpnEeLMAOvEevH292Ltsjz6pXOCqFnUyCqq86paRYPe9pp5Vd9gYFlWbUvH9%2B20BtaHDJW7%2F9BQebM5U%2FimzdlG6pfrWSIu%2FlqHQafMA7WQ9aB50BRWsgl0CrN3pVY%2Fd3WpQ%2F22UapdP4ApVpP2vn2iGzidbEISLAUt%2FLx9msiFB2D%2BDEpRkbq4TKaeUxhYajbFg76wIYXR%2FIptFhXHLcTUXkD4mSn6LBIDtmdV383W0EItl11%2B2tdZdvfW0GAbseXTmG2Dk5tDbY8PF4aBpEaKK0yvO2QeTIUt8X2qMnLjwnqX9WB2hF5sR6hX0vW7t8BUGR9ddckpxaY75yo0HNdqVKv73umMGN6tk15RpXTgFN3TVxfUSjvxha2KErNDd9E283CvI5hRuFV%2BR6qVcMcnX%2FIJ5O4b4dAUe2ykqxWI3qas4W%2B8bOUeo%2BGyo3YBqR7BG2JuzUW2FykBhC2ioVf%2Fkm%2BTsAWjD%2Bl6%2Bm%2FxTqCnO0X3NJEmMAjncs9PSkAsfLusj2QJSG1jbOj%2BbbypH9ybKsDceFONN7U9DWtgF4SMo4z07mhY1Tj1d7jgIa%2BSIqCIEIteFpR3tThL6WF2hSprKF9lFYm%2BP2Z%2F2POUuajh%2B4Qoa42vhmfVjK3yMtOab0bbw5p5Ky9HbU9jaxCcVmaf1IN0PKqDKyrcsJpBcUh57hCxeTqKQJKG%2BYAHyzCafQdbajKqZlSqbmYVxURwTvIJ%2Fc5TdQvz5GNFoNWW8tlVanngPwbazg9tZRapWblXyyFvQbaGLFINDJU2udfwCh0aEoLoF7Me4kUTtinaGlZVnGdbcgmHLu4eETRvcUcKIWglExJL%2BTVz6s0jtKHJJbWdYKyoGOL7FyiI2W7EVbt4pKmd5TemhkOTXV5S395cV6MqJTvnPHM9GFHVzf4Uc30kn59s6lVAUZt6fQtFvuNB3xtxHmoY3smF6p%2BGGoano4YjnSLeXQb2KZeJ1u299JH8wRK%2FRl%2FrfCPykXEIFhisnkIS7T7PWne8jPrC7aTEy4O%2Bp3UmajufQ0AzumtqpXNJriTxsGo5%2FdRb2FW3Qo0lf6yz4X1d2mn0H2fde%2FtDJqxDRQRoar%2BUuLLsB%2BVQUAsnxQhKyVQHEQWEW4zRJlWIoWm4IgBDgI5FVXTC7GjZNHyBv2Caq%2FnwNWGLCjU1WYMZozqfQXX2vdJ6CMvxa%2FeU%2Bu0gackxQJMYIaI7pylBLsWRx%2B79%2FwE%3D"></iframe>
    </div>

    <script src="app.js"></script>
  </body>
</html>