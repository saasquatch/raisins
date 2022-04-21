Feature: HTML Equivalency Checker

	HTML Comparison is hard because there are many ways of writing HTML where it might be a different string, but equivalent for most purposes.
	For example, minified HTML should be equivalent to the source HTML, even though it has less whitespace.

	Based roughty on `node.isEqualNode` (https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode) except that it's not implemented in jsdom,
	and it doesn't look for CSS equivalency.

	@motivating
	Scenario Outline: Differences in simple nodes will fail
		Ensures inequvalent nodes should fail when compared.

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will not be equivalent

		Examples:
			| First                    | Second                |
			| <div></div>              |                       |
			| <div>                    | </div>                |
			| <div></div>              | <span></span>         |
			| <div id></div>           | <div></div>           |
			| <div id=""></div>        | <div></div>           |
			| <div id="value"></div>   | <div></div>           |
			| <div>Has text</div>      | <div></div>           |
			| <div><span></span></div> | <div></div>           |
			| <!DOCTYPE html>          | <!--DOCTYPE html-->   |
			| <!DOCTYPE html>          | <?DOCTYPE html?>      |
			| <?DOCTYPE html?>         | <!--DOCTYPE html-->   |
			| <div style></div>        | <div></div>           |
			| <div style=""></div>     | <div></div>           |
			| <div style=style></div>  | <div></div>           |
			| <noscript></noscript>    | <textarea></textarea> |

	@motivating
	Scenario Outline: Optional tags can be omitted
		Spec: https://html.spec.whatwg.org/multipage/syntax.html#optional-tags

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will be equivalent

		Examples:
			| First                                     | Second                                                                           |
			| <div></div>                               | <html><head></head><body><div></div></body><html>                                |
			| <body><div></div></body>                  | <html><head></head><body><div></div></body><html>                                |
			| <html><div></div></html>                  | <html><head></head><body><div></div></body><html>                                |
			| <meta charset="UTF-8"><div></div>         | <html><head><meta charset="UTF-8"></head><body><div></div></body<html>           |
			| <title>hello world</title><p>text ...</p> | <html><head><title>hello world</title></head><body><p>text ...</p></body></html> |
			| <html><!--comment--><div></div></html>    | <html><!--comment--><head></head><body><div></div></body<html>                   |
			| <head><!--comment--></head><div></div>    | <html><head><!--comment--></head><body><div></div></body<html>                   |
			| <body><!--comment--><div></div></body>    | <html><head></head><body><!--comment--><div></div></body><html>                  |
			| <html lang="en"><div></div></html>        | <html lang="en"><head></head><body><div></div></body<html>                       |
			| <!--comment--><div></div>                 | <!--comment--><html><head></head><body><div></div></body<html>                   |
			| <!DOCTYPE html><div></div>                | <!DOCTYPE html><html><head></head><body><div></div></body><html>                 |


	@motivating
	Scenario Outline: Optional tags cannot be omitted if immediately folllowed by a comment or contain any attributes
		Spec: https://html.spec.whatwg.org/multipage/syntax.html#optional-tags

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will not be equivalent

		Examples:
			| First                                     | Second                                                                                     |
			| <html><!--comment--><div></div></html>    | <!--comment--><html><head></head><body><div></div></body<html>                             |
			| <head><!--comment--></head><div></div>    | <!--comment--><html><head></head><body><div></div></body<html>                             |
			| <body><!--comment--><div></div></body>    | <!--comment--><html><head></head><body><div></div></body<html>                             |
			| <html lang="en"><div></div></html>        | <html><head></head><body><div></div></body<html>                                           |
			| <title>hello world</title><p>text ...</p> | <html lang="en"><head><title>hello world</title></head><body><p>text ...</p></body></html> |
			| <div></div>                               | <!DOCTYPE html><html><head></head><body><div></div></body><html>                           |

	@motivating
	Scenario Outline: Misnested tags are handled as per specifications
		Spec: https://html.spec.whatwg.org/multipage/parsing.html#misnested-tags:-b-i-/b-/i

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will be equivalent

		Examples:
			| First                      | Second                            |
			| <p>1<b>2<i>3</b>4</i>5</p> | <p>1<b>2<i>3</i></b><i>4</i>5</p> |
			| <b>1<p>2</b>3</p>          | <b>1</b><p><b>2</b>3</p>          |


	@motivating
	Scenario Outline: Attribute order does not matter
		Spec: https://dom.spec.whatwg.org/#ref-for-dom-node-isequalnode%E2%91%A0

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will be equivalent

		Examples:
			| First                      | Second                     |
			| <div a b></div>            | <div b a></div>            |
			| <span a="value" b></span>  | <span b a="value"></span>  |
			| <div><h1 a b></h1></div>   | <div><h1 b a></h1></div>   |
			| <div a b><p b a></p></div> | <div b a><p a b></p></div> |

	@motivating
	Scenario Outline: Boolean attirbutes
		Spec: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will be equivalent

		Examples:
			| First                        | Second                       |
			| <details open></details>     | <details open=""></details>  |
			| <details open=""></details>  | <details open=""></details>  |
			| <details style></details>    | <details style=""></details> |
			| <details style=""></details> | <details style=""></details> |

	@motivating
	Scenario Outline: HTML singleton tags with no closing bracket
		Closing tag should not be needed in certain html tags (e.g. <img>)
		Spec: https://html.spec.whatwg.org/multipage/syntax.html#void-elements

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will be equivalent

		Examples:
			| First                  | Second                       |
			| <img>                  | <img></img>                  |
			| <area>                 | <area></area>                |
			| <base>                 | <base></base>                |
			| <input>                | <input></input>              |
			| <embed>                | <embed></embed>              |
			| <meta>                 | <meta></meta>                |
			| <hr>                   | <hr />                       |
			| <col>                  | <col />                      |
			| <link>                 | <link />                     |
			| <source>               | <source />                   |
			| <track>                | <track />                    |
			| <wbr>                  | <wbr />                      |
			| <br>                   | </br>                        |
			| <br>                   | <br/>                        |
			| <img src="helloworld"> | <img src="helloworld"></img> |

	@motivating
	Scenario Outline: Extra whitespace does not matter
		Given one HTML string <First>
		And another HTML string <Second>
		Then they will be equivalent

		Examples:
			| First                     | Second                          |
			| <div> </div>              | <div>  </div>                   |
			| <div     open   ></div>   | <div open></div>                |
			| <body><div> </div></body> | <body><div>       </div></body> |

	@motivating
	Scenario Outline: Whitespace does matter
		The presences of whitespace matters in certain situations because it affects text rendering.
		Spec:: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will not be equivalent

		Examples:
			| First                                 | Second                               |
			| <div>Hello <b>World</b></div>         | <div>Hello<b>World</b></div>         |
			| <span>Hello <span>World</span></span> | <span>Hello<span>World</span></span> |

	@motivating
	Scenario Outline: Encoded characters do not matter

		Given one HTML string <First>
		And another HTML string <Second>
		Then they will be equivalent

		Examples:
			| First                                                                 | Second                                                                                             |
			| <a name="&lpos=Class&lid=<span style='color: green'>CT</span>"  ></a> | <a  name="&amp;lpos=Class&amp;lid=&lt;span style=&apos;color: green&apos;&gt;CT&lt;/span&gt;"></a> |
			| <img src="" alt="(Photo: NASA&amp;JAXA/Inode)>                        | <img src="" alt="(Photo: NASA&JAXA/Inode)>                                                         |
			| <div>And &#x2014; poof &#x2014; time is gone.</div>                   | <div>And &mdash; poof &mdash; time is gone.</div>                                                  |

	@motivating
	Scenario Outline: Unequivalent CSS styles will cause failures
		Given one HTML string <First>
		And another HTML string <Second>
		Then they will not be equivalent

		Examples:
			| First                                          | Second                                     |
			| <div style="display: none; "></div>            | <div style="bold:true;"></div>             |
			| <div style="display: blue; "></div>            | <div style="bold: contents;"></div>        |
			| <div style='opacity: 0.5"></div>               | <div style="opacity: 0.5"></div>           |
			| <style> body {border: 1px solid red;} </style> | <style> body {color: blue;} </style>       |
			| <style> body {display: none;} </style>         | <style> body {DISPLAY : CONTENTS} </style> |
			| <style> body {color: red;} </style>            | <style> body {color: red}; </style>        |

	@motivating
	Scenario Outline: Unequivalent CSS styles will ignore text differences
		Given one HTML string <First>
		And another HTML string <Second>
		Then they will be equivalent

		Examples:
			| First                                           | Second                                                        |
			| <div style="display: none;"></div>              | <div style="display:none"></div>                              |
			| <div style="display: none;"></div>              | <div style="DISPLAY: NONE;"></div>                            |
			| <div style="   display: none; "></div>          | <div style="display: none;"></div>                            |
			| <div style="opacity: 0.5"></div>                | <div style='opacity: 0.5'></div>                              |
			| <style>     body {   color:   red} </style>     | <style> body {color: red;} </style>                           |
			| <style type="text/css">body{color:red;}</style> | <style    type='text/css'  >  body  {color:   red}   </style> |
			| <style> body {display: none;} </style>          | <style> body {DISPLAY : NONE} </style>                        |
			| <style> body {/* color: red; */} </style>       | <style> body {/* color: blue; */} </style>                    |
			| <style> body {} </style>                        | <style> body {/* color: blue; */} </style>                    |

	@motivating
	Scenario Outline: Ignore comments flag will ignore comments in comparison

		Given one HTML string <First>
		And another HTML string <Second>
		And ignoreComments option is true
		Then they will be equivalent

		Examples:
			| First                                | Second                               |
			| <div>hello world</div>               | <!--comment--><div>hello world</div> |
			| <!--a--><div>hello world</div>       | <!--b--><div>hello world</div>       |
			| <div>hello world</div><!--comment--> | <div>hello world</div>               |