<style type="text/css">
input, textarea {
display: block;
outline: 0;
border: 0;
}
input:focus, textarea:focus {
transition: 0.2s;
}
body {
background-color: #fff;
font-family: 'Open Sans', Helvetica, sans-serif;
}
.container {
width: 100%;
margin: 30px auto;
}
#first {
width: 350px;
float: left;
margin-left: 2%;
margin-right: 2%;
}
#two {
width: 100px;
float: left;
margin-right: 2%;
margin-left: 2%;
padding-top: 15%;
}
#three {
width: 680px;
float: left;
margin-left: 1%;
margin-top: -12px; 
}
.form__label {
display: block;
margin-bottom: 0.625em;
}
.form__label--hidden {
border: 0;
clip: rect(0 0 0 0);
height: 1px;
margin: -1px;
overflow: hidden;
padding: 0;
position: absolute;
width: 1px;
}
.form__input {
width: 100%;
height: 560px; 
font-size: 1em;
padding: 0.83333em;
margin-bottom: 5px;
border: 6px solid #05bcaf;
border-radius: 0.4em;
background: #ebecec;
color: #656D78;
font-weight: 300;
}
.form__modal {
width: 83%;
font-size: 1em;
padding: 0.83333em;
margin-bottom: 5px;
border-bottom: 6px solid #05bcaf;
border-radius: 0.4em;
background: #ebecec;
color: #656D78;
font-weight: 300;
}
.load-json, .reset, .collapse, .expand, [type^="button"] {
padding: 0.9375em 1.875em;
border: 0;
border-radius: 0.4em;
color: #fff;
text-transform: uppercase;
font-size: 0.875em;
font-weight: 400;
transition: opacity 0.2s;
display: block;
width: 100%;
}
.load-json:hover, .reset:hover, .collapse:hover, .expand:hover, [type^="button"]:hover {
opacity: 0.75;
cursor: pointer;
}
.load-json {
background-color: #3BAFDA;
}
.reset {
background-color: #e87376;
}
.collapse {
background-color: #D770AD;
}
.expand {
background-color: #F6BB42;
}
[type^="button"] {
margin-bottom: 1.42857em; 
width: 120px;
margin-right: 0.625em;
outline:none;
}
.json-viewer {
display: inline-block;
overflow: scroll;
height: 563px;
width: 600px;
color: #656D78;
padding: 10px 10px 10px 20px;
background-color: #ebecec;
border: 6px solid #05bcaf;
border-radius: 0.4em;
margin-bottom: 3px;
}
.json-viewer ul {
list-style-type: none;
margin: 0;
margin: 0 0 0 1px;
border-left: 3px dotted #ccc;
padding-left: 2em;
}
.json-viewer .hide {
display: none;
}
.json-viewer ul li .type-string,
.json-viewer ul li .type-date {
color: #05bcaf;
}
.json-viewer ul li .type-boolean {
color: #F6BB42;
font-weight: bold;
}
.json-viewer ul li .type-number {
color: #e87376;
}
.json-viewer ul li .type-null {
color: #EC87C0;
}
.json-viewer a.list-link {
color: #656D78;
text-decoration: none;
position: relative;
}
.json-viewer a.list-link:before {
color: #aaa;
content: "\25BC";
position: absolute;
display: inline-block;
width: 1em;
left: -1em;
}
.json-viewer a.list-link.collapsed:before {
content: "\25B6";
}
.json-viewer a.list-link.empty:before {
content: "";
}
.json-viewer .items-ph {
color: #aaa;
padding: 0 1em;
}
.json-viewer .items-ph:hover {
text-decoration: underline;
}
</style>