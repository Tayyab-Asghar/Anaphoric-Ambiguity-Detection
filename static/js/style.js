$(document).ready(function(){
    $(window).scroll(function(){
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        }else{
            $('.navbar').removeClass("sticky");
        }
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        }else{
            $('.scroll-up-btn').removeClass("show");
        }
    });
    $('.scroll-up-btn').click(function(){
        $('html').animate({scrollTop: 0});
        $('html').css("scrollBehavior", "auto");
    });

    $('.navbar .menu li a').click(function(){
        $('html').css("scrollBehavior", "smooth");
    });
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });
    $(document).ready(function(){
        $('#upload-button').click(function() {
            $('#upload-input').click();
        });

        $('#upload-input').change(function() {
            var file = this.files[0];
            var formData = new FormData();
            formData.append('file', file);
            var uploadEndpoint = '/upload'; 
            $.ajax({
                url: uploadEndpoint,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    console.log('File uploaded successfully!');
                    $('#upload-status').show(); 
                },
                error: function(error) {
                    console.error('Error uploading file:', error);
                }
            });
        });
    });
    document.getElementById("upload-button").addEventListener("click", function() {
        var fileInput = document.getElementById("upload-input");
        if (fileInput.files.length > 0) {
            document.getElementById("upload-status").style.display = "block";
            var file = fileInput.files[0];
            var reader = new FileReader();
            reader.onload = function(event) {
                var data = event.target.result;
                var processedData = processDataset(data);
                console.log(processedData); 
                document.getElementById("processed-status").style.display = "block";
            };
            reader.readAsBinaryString(file); 
        }
    });
    
    document.getElementById('upload-button').addEventListener('click', function() {
        const input = document.getElementById('upload-input');
        if (input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = e.target.result;
                const processedData = processDataset(data);
                console.log(processedData);
            };
            reader.readAsBinaryString(file);
        }
    });
    function processDataset(data) {
        var workbook = XLSX.read(data, {type: 'binary'});
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
        var headers = rows[0];
        var jsonData = [];
        for (var i = 1; i < rows.length; i++) {
            var row = rows[i];
            if (row.length === headers.length) { 
                var obj = {};
                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j].trim()] = row[j].trim();
                }
                jsonData.push(obj);
            }
        }
        jsonData.forEach(item => {
            const text = item['Context(cj)'];
            const { nounPhrases, pronouns } = preprocessText(text);
            item['Noun Phrases'] = nounPhrases.join(', ');
            item['Pronouns'] = pronouns.join(', ');
            if (nounPhrases.length >= 2 && pronouns.length > 0) {
                const np1 = nounPhrases[0];
                const np2 = nounPhrases[1];
                const pron = pronouns[0];

                item['Full String Matching'] = fullStringMatching(np1, np2);
                item['Headword Matching'] = headwordMatching(np1, np2);
                item['Modifier Matching'] = modifierMatching(np1, np2);
                item['Definite or Demonstrative NP'] = isDefiniteOrDemonstrativeNP(np1);
                item['Proper Name NP'] = isProperNameNP(np1);
                item['Number Agreement'] = numberAgreementNP(np1, np2);
                item['PP Attachment'] = ppAttachment(np1, np2);
                item['Appositive'] = appositive(np1, np2);
                item['Syntactic Role'] = syntacticRole(np1, np2);
                item['Semantic Class'] = semanticClass(np1, np2);
            }
        });
        console.log(jsonData); 
        return jsonData;
    }
    function preprocessText(text) {
        const nlp = window.nlp;
        const doc = nlp(text);
        const nounPhrases = doc.nouns().out('array');
        const pronouns = doc.pronouns().out('array');
        return { nounPhrases, pronouns };
    }
    function fullStringMatching(np1, np2) {
        return np1 === np2;
    }

    function headwordMatching(np1, np2) {
        return np1.split()[0] === np2.split()[0];
    }

    function modifierMatching(np1, np2) {
        return new Set(np1.split()).size === new Set(np2.split()).size;
    }

    function isDefiniteOrDemonstrativeNP(np) {
        const doc = nlp(np);
        return doc.match('(the|this|that|these|those)').found;
    }

    function isProperNameNP(np) {
        const doc = nlp(np);
        return doc.nouns().isProperNoun().out('array').length > 0;
    }

    function numberAgreementNP(np1, np2) {
        const doc1 = nlp(np1);
        const doc2 = nlp(np2);
        const singular1 = doc1.nouns().isSingular().out('array').length > 0;
        const singular2 = doc2.nouns().isSingular().out('array').length > 0;
        return singular1 === singular2;
    }

    function ppAttachment(np1, np2) {
        const doc1 = nlp(np1);
        const doc2 = nlp(np2);
        return doc1.has(np2) || doc2.has(np1);
    }

    function appositive(np1, np2) {
        const doc1 = nlp(np1);
        const doc2 = nlp(np2);
        return doc1.has(np2) && doc1.match('appos') || doc2.has(np1) && doc2.match('appos');
    }

    function syntacticRole(np1, np2) {
        const doc1 = nlp(np1);
        const doc2 = nlp(np2);
        return doc1.out('terms').every(term => term.tags.includes('Role')) &&
               doc2.out('terms').every(term => term.tags.includes('Role'));
    }

    function semanticClass(np1, np2) {
        return np1.split()[0] === np2.split()[0];
    }
});